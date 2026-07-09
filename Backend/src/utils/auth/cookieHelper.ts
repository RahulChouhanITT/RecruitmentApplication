import type { Response } from 'express';
import { env } from '../../configuration/env';
import { APPLICATION_CONSTANTS } from '../constants/applicationConstants';
import { CONFIGURATION_CONSTANTS } from '../constants/configurationConstants';
import type { UserRole } from '../types/authTypes';

const buildCookieOptions = (maxAge?: number) => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: env.NODE_ENV === CONFIGURATION_CONSTANTS.ENVIRONMENTS.PRODUCTION,
  ...(maxAge === undefined ? {} : { maxAge }),
});

export const setAuthenticationCookie = (res: Response, token: string): void => {
  res.cookie(
    APPLICATION_CONSTANTS.TOKEN_COOKIE_NAME,
    token,
    buildCookieOptions(APPLICATION_CONSTANTS.COOKIE_MAX_AGE_MS),
  );
};

export const clearAuthenticationCookie = (res: Response): void => {
  res.clearCookie(APPLICATION_CONSTANTS.TOKEN_COOKIE_NAME, buildCookieOptions());
};

export const setGoogleOAuthStateCookie = (res: Response, state: string): void => {
  res.cookie(
    APPLICATION_CONSTANTS.GOOGLE_OAUTH.STATE_COOKIE_NAME,
    state,
    buildCookieOptions(APPLICATION_CONSTANTS.GOOGLE_OAUTH.STATE_MAX_AGE_MS),
  );
};

export const clearGoogleOAuthStateCookie = (res: Response): void => {
  res.clearCookie(APPLICATION_CONSTANTS.GOOGLE_OAUTH.STATE_COOKIE_NAME, buildCookieOptions());
};

export const setGoogleOAuthContextCookie = (res: Response, role?: UserRole): void => {
  res.cookie(
    APPLICATION_CONSTANTS.GOOGLE_OAUTH.CONTEXT_COOKIE_NAME,
    role ?? APPLICATION_CONSTANTS.EMPTY_STRING,
    buildCookieOptions(APPLICATION_CONSTANTS.GOOGLE_OAUTH.STATE_MAX_AGE_MS),
  );
};

export const clearGoogleOAuthContextCookie = (res: Response): void => {
  res.clearCookie(APPLICATION_CONSTANTS.GOOGLE_OAUTH.CONTEXT_COOKIE_NAME, buildCookieOptions());
};
