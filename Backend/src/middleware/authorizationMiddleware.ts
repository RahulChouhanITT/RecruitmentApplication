import type { NextFunction, Request, Response } from 'express';
import { UserModel } from '../models/userModel';
import { ApplicationError } from '../utils/errors/applicationError';
import { APPLICATION_MESSAGES } from '../utils/messages/applicationMessages';
import { APPLICATION_CONSTANTS } from '../utils/constants/applicationConstants';
import type { AuthenticatedRequest, UserRole } from '../utils/types/authTypes';

export const authorizeRoles = (allowedRoles: readonly UserRole[]) => {
  return async (
    req: Request & AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.authenticatedUserId) {
        return next(
          new ApplicationError(
            APPLICATION_MESSAGES.ERROR.UNAUTHORIZED,
            APPLICATION_CONSTANTS.HTTP_STATUS_CODES.UNAUTHORIZED,
          ),
        );
      }

      const currentUser = await UserModel.findById(req.authenticatedUserId).select('role');
      if (!currentUser) {
        return next(
          new ApplicationError(
            APPLICATION_MESSAGES.AUTH.USER_NOT_FOUND,
            APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND,
          ),
        );
      }

      if (!allowedRoles.includes(currentUser.role)) {
        return next(
          new ApplicationError(
            APPLICATION_MESSAGES.ERROR.FORBIDDEN,
            APPLICATION_CONSTANTS.HTTP_STATUS_CODES.FORBIDDEN,
          ),
        );
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};
