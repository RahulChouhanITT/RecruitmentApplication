import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';
import { UserModel } from '../../models/userModel';
import { AUTH_SAFE_USER_FIELDS } from '../../utils/constants';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { ApplicationError } from '../../utils/errors/applicationError';
import { assertEntityExists } from '../../utils/common/entityHelpers';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';
import { normalizeEmailAddress, trimValue } from '../../utils/common/stringHelpers';
import {
  buildOtpVerificationNotificationPayload,
  createRoleProfileRecord,
  validateRegisterInput,
} from '../../utils/auth';
import type { RegisterRequestBody } from '../../utils/types';
import type { NotificationPayload, ServiceResult } from '../../utils/types';

const fetchSafeUserById = async (userId: Types.ObjectId) => {
  const safeUser = await UserModel.findById(userId).select(AUTH_SAFE_USER_FIELDS).lean();
  assertEntityExists(
    safeUser,
    APPLICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
    APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
  );
  return safeUser;
};

const findExistingUserByEmail = async (email: string) => {
  return UserModel.findOne({ email }).lean();
};

const createUserRecord = async (registrationInput: RegisterRequestBody) => {
  return UserModel.create({
    name: trimValue(registrationInput.name),
    email: normalizeEmailAddress(registrationInput.email),
    passwordHash: registrationInput.password,
    role: registrationInput.role,
    authProvider: 'local',
  });
};

const refreshOtpForUser = async (userId: Types.ObjectId): Promise<string> => {
  const otpCode = `${Math.floor(100000 + Math.random() * 900000)}`;
  const otpCodeHash = await bcrypt.hash(otpCode, 10);
  const otpExpiryTime = new Date(
    Date.now() + APPLICATION_CONSTANTS.OTP_EXPIRES_IN_MINUTES * 60 * 1000,
  );

  await UserModel.findByIdAndUpdate(userId, {
    $set: {
      otpCodeHash,
      otpExpiryTime,
      otpAttemptCount: 0,
    },
  });

  return otpCode;
};

export const registerUser = async (
  registrationInput: RegisterRequestBody,
): Promise<
  ServiceResult<
    { user: Awaited<ReturnType<typeof fetchSafeUserById>>; otpCode: string },
    NotificationPayload
  >
> => {
  validateRegisterInput(registrationInput);
  const normalizedEmail = normalizeEmailAddress(registrationInput.email);

  const existingUser = await findExistingUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.AUTH.EMAIL_ALREADY_EXISTS,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.CONFLICT,
    );
  }

  const createdUser = await createUserRecord(registrationInput);
  await createRoleProfileRecord(registrationInput.role, (createdUser._id as Types.ObjectId).toString());
  const otpCode = await refreshOtpForUser(createdUser._id as Types.ObjectId);
  const safeUser = await fetchSafeUserById(createdUser._id as Types.ObjectId);

  return {
    data: { user: safeUser, otpCode },
    notificationPayload: buildOtpVerificationNotificationPayload(
      createdUser.email,
      otpCode,
      createdUser.name,
    ),
  };
};
