import { APPLICATION_CONSTANTS } from '../../../utils/constants/applicationConstants';
import { ApplicationError } from '../../../utils/errors/applicationError';
import { APPLICATION_MESSAGES } from '../../../utils/messages/applicationMessages';
import type { NotificationPayload } from '../../../utils/types';
import { isBooleanValue } from '../../../utils/http/requestHelpers';

export const buildPendingApprovalUsersFilterForAdmin = () => ({
  isEmailVerified: true,
  isApproved: false,
  role: {
    $in: [APPLICATION_CONSTANTS.USER_ROLES.HR, APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER],
  },
});

export const buildApprovedInterviewersFilterForSelection = () => ({
  role: APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER,
  isEmailVerified: true,
  isApproved: true,
});

export const assertValidApprovalStatusInput = (isApproved: boolean): void => {
  if (!isBooleanValue(isApproved)) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.ERROR.VALIDATION_FAILED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }
};

export const buildUserApprovalNotificationPayload = (
  isApproved: boolean,
  user: { email: string; name: string },
): NotificationPayload | null => {
  return isApproved
    ? {
        kind: 'approvalSuccess',
        emailAddress: user.email,
        userName: user.name,
      }
    : null;
};
