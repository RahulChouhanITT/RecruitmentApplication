import type { Request, Response } from 'express';
import { env } from '../configuration/env';
import { APPLICATION_CONSTANTS } from '../utils/constants/applicationConstants';
import { sendSuccessResponse } from '../utils/http/responseHelpers';
import {
  clearAuthenticationCookie,
  clearGoogleOAuthContextCookie,
  clearGoogleOAuthStateCookie,
  setAuthenticationCookie,
  setGoogleOAuthContextCookie,
  setGoogleOAuthStateCookie,
} from '../utils/auth/cookieHelper';
import { loginUser as loginUserService } from '../services/auth/authLoginService';
import {
  completeGoogleAuthentication,
  startGoogleAuthentication,
} from '../services/auth/authGoogleService';
import { registerUser as registerUserService } from '../services/auth/authRegistrationService';
import {
  resendEmailOtp as resendEmailOtpService,
  verifyEmailOtp as verifyEmailOtpService,
} from '../services/auth/authVerificationService';
import { sendNotification } from '../services/notification/notificationDispatcher';
import { APPLICATION_MESSAGES } from '../utils/messages/applicationMessages';
import { generateAuthenticationToken } from '../utils/auth/tokenHelper';
import type {
  LoginRequestBody,
  RegisterRequestBody,
  ResendOtpRequestBody,
  UserRole,
  VerifyEmailRequestBody,
} from '../utils/types/authTypes';
import type { GoogleAuthStartQuery, GoogleOAuthCodeQuery } from '../utils/types/googleOAuthTypes';
import { ApplicationError } from '../utils/errors/applicationError';
import { USER_ROLES } from '../utils/types/authTypes';

const isUserRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && USER_ROLES.includes(value as UserRole);

const clearGoogleAuthCookies = (response: Response): void => {
  clearGoogleOAuthStateCookie(response);
  clearGoogleOAuthContextCookie(response);
};

const redirectToFrontendPath = (
  response: Response,
  pathname: string,
  params?: Record<string, string>,
): void => {
  const frontendOrigin = env.FRONTEND_ORIGIN;
  if (!frontendOrigin) {
    throw new Error('FRONTEND_ORIGIN is not configured');
  }

  const url = new URL(pathname, frontendOrigin);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  response.redirect(url.toString());
};

export const registerUser = async (
  req: Request<unknown, unknown, RegisterRequestBody>,
  res: Response,
): Promise<void> => {
  const registrationPayload = req.body;
  const registrationResult = await registerUserService(registrationPayload);
  await sendNotification(registrationResult.notificationPayload);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.CREATED,
    message: APPLICATION_MESSAGES.AUTH.REGISTER_SUCCESS,
  });
};

export const loginUser = async (
  req: Request<unknown, unknown, LoginRequestBody>,
  res: Response,
): Promise<void> => {
  const loginPayload = req.body;
  const loginResult = await loginUserService(loginPayload);
  const authenticatedUser = loginResult.data;
  const token = generateAuthenticationToken(authenticatedUser._id.toString());
  setAuthenticationCookie(res, token);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.AUTH.LOGIN_SUCCESS,
  });
};

export const verifyEmailOtp = async (
  req: Request<unknown, unknown, VerifyEmailRequestBody>,
  res: Response,
): Promise<void> => {
  const verificationPayload = req.body;
  const verificationResult = await verifyEmailOtpService(verificationPayload);
  await sendNotification(verificationResult.notificationPayload);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.AUTH.VERIFY_EMAIL_SUCCESS,
  });
};

export const resendEmailOtp = async (
  req: Request<unknown, unknown, ResendOtpRequestBody>,
  res: Response,
): Promise<void> => {
  const resendOtpPayload = req.body;
  const resendOtpResult = await resendEmailOtpService(resendOtpPayload);
  await sendNotification(resendOtpResult.notificationPayload);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.AUTH.OTP_RESENT,
  });
};

export const logoutUser = async (_req: Request, res: Response): Promise<void> => {
  clearAuthenticationCookie(res);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.AUTH.LOGOUT_SUCCESS,
  });
};

export const startGoogleLogin = async (
  req: Request<unknown, unknown, unknown, GoogleAuthStartQuery>,
  res: Response,
): Promise<void> => {
  const requestedRole = isUserRole(req.query.role) ? req.query.role : undefined;
  const { state, authorizationUrl } = startGoogleAuthentication();

  setGoogleOAuthStateCookie(res, state);
  setGoogleOAuthContextCookie(res, requestedRole);
  res.redirect(authorizationUrl);
};

export const handleGoogleLoginCallback = async (
  req: Request<unknown, unknown, unknown, GoogleOAuthCodeQuery>,
  res: Response,
): Promise<void> => {
  const { code, state, error } = req.query;
  const storedState = req.cookies?.[APPLICATION_CONSTANTS.GOOGLE_OAUTH.STATE_COOKIE_NAME];
  const storedRoleCookie = req.cookies?.[APPLICATION_CONSTANTS.GOOGLE_OAUTH.CONTEXT_COOKIE_NAME];
  const storedRole = isUserRole(storedRoleCookie) ? storedRoleCookie : undefined;

  clearGoogleAuthCookies(res);

  if (error) {
    redirectToFrontendPath(res, '/auth/login', {
      authError: APPLICATION_MESSAGES.GOOGLE_OAUTH.ACCESS_DENIED,
    });
    return;
  }

  if (!code) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.GOOGLE_OAUTH.MISSING_CODE,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  try {
    const googleLoginResult = await completeGoogleAuthentication({
      code,
      state,
      storedState,
      role: storedRole,
    });

    await sendNotification(googleLoginResult.notificationPayload);

    if (googleLoginResult.integrationPayload?.shouldCreateSession) {
      const token = generateAuthenticationToken(googleLoginResult.data._id.toString());
      setAuthenticationCookie(res, token);
      redirectToFrontendPath(res, '/dashboard');
      return;
    }

    redirectToFrontendPath(res, '/auth/login', {
      authError: APPLICATION_MESSAGES.AUTH.USER_NOT_APPROVED,
      authProvider: 'google',
    });
  } catch (error) {
    clearAuthenticationCookie(res);

    const message =
      error instanceof ApplicationError
        ? error.message
        : APPLICATION_MESSAGES.GOOGLE_OAUTH.AUTHORIZATION_FAILED;

    redirectToFrontendPath(res, '/auth/login', {
      authError: message,
      authProvider: 'google',
    });
  }
};
