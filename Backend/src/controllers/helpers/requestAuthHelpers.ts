import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { ApplicationError } from '../../utils/errors/applicationError';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';
import type { AuthenticatedRequest } from '../../utils/types/authTypes';

export const getAuthenticatedUserId = (request: AuthenticatedRequest): string => {
  if (!request.authenticatedUserId) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.ERROR.UNAUTHORIZED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.UNAUTHORIZED,
    );
  }

  return request.authenticatedUserId;
};
