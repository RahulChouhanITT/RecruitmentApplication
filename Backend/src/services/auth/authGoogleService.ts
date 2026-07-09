import crypto from 'crypto';
import { google } from 'googleapis';
import { Types } from 'mongoose';
import { env } from '../../configuration/env';
import { type IUser, UserModel } from '../../models/userModel';
import { AUTH_SAFE_USER_FIELDS } from '../../utils/constants';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { assertEntityExists } from '../../utils/common/entityHelpers';
import { normalizeEmailAddress, trimValue } from '../../utils/common/stringHelpers';
import { ApplicationError } from '../../utils/errors/applicationError';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';
import {
  buildApprovalPendingNotificationPayload,
  createRoleProfileRecord,
  mergeAuthProvider,
} from '../../utils/auth';
import type {
  NotificationPayload,
  ServiceResult,
  UserRole,
} from '../../utils/types';

type GoogleProfile = {
  email: string;
  name: string;
  googleId: string;
  avatarUrl?: string;
};

type StartGoogleAuthResult = {
  state: string;
  authorizationUrl: string;
};

type CompleteGoogleAuthResult = ServiceResult<
  Awaited<ReturnType<typeof fetchSafeUserById>>,
  NotificationPayload | null,
  {
    shouldCreateSession: boolean;
    isNewUser: boolean;
  }
>;

const createGoogleAuthClient = () => {
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  const redirectUri = env.GOOGLE_AUTH_REDIRECT_URI ?? env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.GOOGLE_OAUTH.NOT_CONFIGURED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

const fetchSafeUserById = async (userId: Types.ObjectId) => {
  const safeUser = await UserModel.findById(userId).select(AUTH_SAFE_USER_FIELDS).lean();
  assertEntityExists(
    safeUser,
    APPLICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
    APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
  );
  return safeUser;
};

const generateState = (): string => {
  return crypto.randomBytes(APPLICATION_CONSTANTS.GOOGLE_OAUTH.STATE_BYTE_LENGTH).toString('hex');
};

const resolveNewUserRole = (role?: UserRole): UserRole => {
  return role ?? APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE;
};

const fetchGoogleProfile = async (code: string): Promise<GoogleProfile> => {
  const oauthClient = createGoogleAuthClient();

  try {
    const tokenResponse = await oauthClient.getToken(code);
    oauthClient.setCredentials(tokenResponse.tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauthClient });
    const { data } = await oauth2.userinfo.get();

    const email = normalizeEmailAddress(data.email ?? APPLICATION_CONSTANTS.EMPTY_STRING);
    const name = trimValue(data.name ?? APPLICATION_CONSTANTS.EMPTY_STRING);
    const googleId = trimValue(data.id ?? APPLICATION_CONSTANTS.EMPTY_STRING);
    const avatarUrl = trimValue(data.picture ?? APPLICATION_CONSTANTS.EMPTY_STRING) || undefined;

    if (!email) {
      throw new ApplicationError(
        APPLICATION_MESSAGES.GOOGLE_OAUTH.EMAIL_REQUIRED,
        APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
      );
    }

    if (!googleId) {
      throw new ApplicationError(
        APPLICATION_MESSAGES.GOOGLE_OAUTH.AUTHORIZATION_FAILED,
        APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
      );
    }

    return {
      email,
      name: name || email.split('@')[0],
      googleId,
      avatarUrl,
    };
  } catch (error) {
    if (error instanceof ApplicationError) {
      throw error;
    }

    throw new ApplicationError(
      APPLICATION_MESSAGES.GOOGLE_OAUTH.PROFILE_FETCH_FAILED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    );
  }
};

const createGoogleUser = async (profile: GoogleProfile, role?: UserRole) => {
  const resolvedRole = resolveNewUserRole(role);
  const createdUser = await UserModel.create({
    name: profile.name,
    email: profile.email,
    role: resolvedRole,
    googleId: profile.googleId,
    avatarUrl: profile.avatarUrl,
    authProvider: 'google',
    isEmailVerified: true,
    isApproved: resolvedRole === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE,
    profileCompleted: false,
    lastLoginAt: new Date(),
  });

  await createRoleProfileRecord(resolvedRole, (createdUser._id as Types.ObjectId).toString());

  return createdUser;
};

const updateExistingUserForGoogleLogin = async (
  user: IUser,
  profile: GoogleProfile,
): Promise<void> => {
  if (user.googleId && user.googleId !== profile.googleId) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.GOOGLE_OAUTH.ACCOUNT_CONFLICT,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.CONFLICT,
    );
  }

  user.googleId = profile.googleId;
  user.avatarUrl = profile.avatarUrl ?? user.avatarUrl;
  user.name = profile.name || user.name;
  user.isEmailVerified = true;

  if (user.role === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE) {
    user.isApproved = true;
  }

  user.authProvider = mergeAuthProvider(user.authProvider, 'google');
  user.lastLoginAt = new Date();
  user.otpCodeHash = undefined;
  user.otpExpiryTime = null;
  user.otpAttemptCount = 0;
  await user.save();
};

export const startGoogleAuthentication = (): StartGoogleAuthResult => {
  const oauthClient = createGoogleAuthClient();
  const state = generateState();

  return {
    state,
    authorizationUrl: oauthClient.generateAuthUrl({
      access_type: APPLICATION_CONSTANTS.GOOGLE_OAUTH.ACCESS_TYPE_ONLINE,
      scope: [...APPLICATION_CONSTANTS.GOOGLE_OAUTH.AUTH_SCOPES],
      state,
      prompt: APPLICATION_CONSTANTS.GOOGLE_OAUTH.PROMPT_SELECT_ACCOUNT,
      include_granted_scopes: true,
    }),
  };
};

export const completeGoogleAuthentication = async ({
  code,
  state,
  storedState,
  role,
}: {
  code: string;
  state?: string;
  storedState?: string;
  role?: UserRole;
}): Promise<CompleteGoogleAuthResult> => {
  if (!storedState || !state || storedState !== state) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.GOOGLE_OAUTH.INVALID_STATE,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  const profile = await fetchGoogleProfile(code);
  const existingByGoogleId = await UserModel.findOne({ googleId: profile.googleId });

  if (existingByGoogleId && existingByGoogleId.email !== profile.email) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.GOOGLE_OAUTH.ACCOUNT_CONFLICT,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.CONFLICT,
    );
  }

  let user = existingByGoogleId ?? (await UserModel.findOne({ email: profile.email }));
  let isNewUser = false;

  if (!user) {
    user = await createGoogleUser(profile, role);
    isNewUser = true;
  } else {
    await updateExistingUserForGoogleLogin(user, profile);
  }

  const safeUser = await fetchSafeUserById(user._id as Types.ObjectId);
  const shouldCreateSession = safeUser.isEmailVerified && safeUser.isApproved;

  return {
    data: safeUser,
    notificationPayload: isNewUser
      ? buildApprovalPendingNotificationPayload(safeUser.role, safeUser.email, safeUser.name)
      : null,
    integrationPayload: {
      shouldCreateSession,
      isNewUser,
    },
  };
};
