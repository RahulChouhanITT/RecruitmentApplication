import type { NextFunction, Response } from "express";
import { UserModel } from "../models/userModel";
import { ApplicationError } from "../utils/errors/applicationError";
import { APPLICATION_MESSAGES } from "../utils/messages/applicationMessages";
import { APPLICATION_CONSTANTS } from "../utils/constants/applicationConstants";
import type { AuthenticatedRequest, UserRole } from "../utils/types/authTypes";

export const authorizeRoles = (allowedRoles: UserRole[]) => {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.authenticatedUserId) {
        next(
          new ApplicationError(
            APPLICATION_MESSAGES.ERROR.UNAUTHORIZED,
            APPLICATION_CONSTANTS.HTTP_STATUS_CODES.UNAUTHORIZED
          )
        );
        return;
      }

      const currentUser = await UserModel.findById(req.authenticatedUserId).select("role");
      if (!currentUser) {
        next(
          new ApplicationError(
            APPLICATION_MESSAGES.AUTH.USER_NOT_FOUND,
            APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND
          )
        );
        return;
      }

      if (!allowedRoles.includes(currentUser.role)) {
        next(
          new ApplicationError(
            APPLICATION_MESSAGES.ERROR.FORBIDDEN,
            APPLICATION_CONSTANTS.HTTP_STATUS_CODES.FORBIDDEN
          )
        );
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
