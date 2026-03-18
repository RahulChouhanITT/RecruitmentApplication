import type { Response } from "express";
import { APPLICATION_CONSTANTS } from "../constants/applicationConstants";
import { CONFIGURATION_CONSTANTS } from "../constants/configurationConstants";

export const setAuthenticationCookie = (res: Response, token: string): void => {
  res.cookie(APPLICATION_CONSTANTS.TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === CONFIGURATION_CONSTANTS.ENVIRONMENTS.PRODUCTION,
    maxAge: APPLICATION_CONSTANTS.COOKIE_MAX_AGE_MS,
  });
};

export const clearAuthenticationCookie = (res: Response): void => {
  res.clearCookie(APPLICATION_CONSTANTS.TOKEN_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === CONFIGURATION_CONSTANTS.ENVIRONMENTS.PRODUCTION,
  });
};
