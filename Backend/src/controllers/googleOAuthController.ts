import type { Request, Response } from 'express';
import { env } from '../configuration/env';
import {
  clearAuthenticationCookie,
  clearGoogleOAuthContextCookie,
  clearGoogleOAuthStateCookie,
  setAuthenticationCookie,
} from '../utils/auth/cookieHelper';
import { generateAuthenticationToken } from '../utils/auth/tokenHelper';
import { completeGoogleAuthentication } from '../services/auth/authGoogleService';
import { sendNotification } from '../services/notification/notificationDispatcher';
import {
  exchangeCodeForToken as exchangeCodeForTokenService,
  generateGoogleAuthUrl as generateGoogleAuthUrlService,
} from '../services/google/googleOAuthService';
import { APPLICATION_CONSTANTS } from '../utils/constants/applicationConstants';
import { ApplicationError } from '../utils/errors/applicationError';
import { sendSuccessResponse } from '../utils/http/responseHelpers';
import { isNonEmptyString } from '../utils/http/requestHelpers';
import { APPLICATION_MESSAGES } from '../utils/messages/applicationMessages';
import type { GoogleOAuthCodeQuery } from '../utils/types/googleOAuthTypes';
import { USER_ROLES, type UserRole } from '../utils/types/authTypes';

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

export const generateGoogleAuthUrl = async (_req: Request, res: Response): Promise<void> => {
  const url = generateGoogleAuthUrlService();

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.GOOGLE_OAUTH.URL_GENERATED,
    data: { url },
  });
};

export const handleGoogleOAuthCallback = async (
  req: Request<unknown, unknown, unknown, GoogleOAuthCodeQuery>,
  res: Response,
): Promise<void> => {
  const { code, state, error } = req.query;
  const storedState = req.cookies?.[APPLICATION_CONSTANTS.GOOGLE_OAUTH.STATE_COOKIE_NAME];
  const storedRoleCookie = req.cookies?.[APPLICATION_CONSTANTS.GOOGLE_OAUTH.CONTEXT_COOKIE_NAME];
  const storedRole = isUserRole(storedRoleCookie) ? storedRoleCookie : undefined;
  const isGoogleLoginCallback = isNonEmptyString(storedState) || isNonEmptyString(state);

  if (isGoogleLoginCallback) {
    clearGoogleAuthCookies(res);

    if (error) {
      redirectToFrontendPath(res, '/auth/login', {
        authError: APPLICATION_MESSAGES.GOOGLE_OAUTH.ACCESS_DENIED,
      });
      return;
    }

    if (!isNonEmptyString(code)) {
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
      return;
    } catch (authError) {
      clearAuthenticationCookie(res);

      const message =
        authError instanceof ApplicationError
          ? authError.message
          : APPLICATION_MESSAGES.GOOGLE_OAUTH.AUTHORIZATION_FAILED;

      redirectToFrontendPath(res, '/auth/login', {
        authError: message,
        authProvider: 'google',
      });
      return;
    }
  }

  if (!isNonEmptyString(code)) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.GOOGLE_OAUTH.MISSING_CODE,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  const refreshToken = await exchangeCodeForTokenService(code);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.GOOGLE_OAUTH.AUTHORIZATION_SUCCESS,
    data: {
      refreshToken,
      note: APPLICATION_MESSAGES.GOOGLE_OAUTH.REFRESH_TOKEN_NOTE,
    },
  });
};
