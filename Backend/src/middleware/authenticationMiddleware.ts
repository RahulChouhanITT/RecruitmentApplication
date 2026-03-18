import type { NextFunction, Request, Response } from "express";
import { ApplicationError } from "../utils/errors/applicationError";
import { APPLICATION_CONSTANTS } from "../utils/constants/applicationConstants";
import { APPLICATION_MESSAGES } from "../utils/messages/applicationMessages";
import { verifyAuthenticationToken } from "../utils/auth/tokenHelper";
import type { AuthenticatedRequest } from "../utils/types/authTypes";

export const authenticationMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const token = req.cookies?.[APPLICATION_CONSTANTS.TOKEN_COOKIE_NAME];

  if (!token) {
    next(
      new ApplicationError(
        APPLICATION_MESSAGES.AUTH.TOKEN_MISSING,
        APPLICATION_CONSTANTS.HTTP_STATUS_CODES.UNAUTHORIZED
      )
    );
    return;
  }

  try {
    const decodedToken = verifyAuthenticationToken(token);
    req.authenticatedUserId = decodedToken.userId;
    next();
  } catch (_error) {
    next(
      new ApplicationError(
        APPLICATION_MESSAGES.AUTH.TOKEN_INVALID,
        APPLICATION_CONSTANTS.HTTP_STATUS_CODES.UNAUTHORIZED
      )
    );
  }
};
