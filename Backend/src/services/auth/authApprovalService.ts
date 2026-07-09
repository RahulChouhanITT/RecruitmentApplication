import { UserModel } from '../../models/userModel';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { ApplicationError } from '../../utils/errors/applicationError';
import { assertEntityExists } from '../../utils/common/entityHelpers';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';
import {
  assertValidApprovalStatusInput,
  buildUserApprovalNotificationPayload,
  buildApprovedInterviewersFilterForSelection,
  buildPendingApprovalUsersFilterForAdmin,
} from './helpers/authApprovalHelpers';
import { USER_SAFE_FIELDS, USER_SELECTION_FIELDS } from '../../utils/constants';
import type { NotificationPayload, ServiceResult } from '../../utils/types';

const INTERVIEWER_DIRECTORY_DEFAULT_PAGE = 1;
const INTERVIEWER_DIRECTORY_DEFAULT_LIMIT = 10;

type InterviewerDirectoryQuery = {
  page?: number;
  limit?: number;
};

export const listPendingApprovalUsersForAdmin = async () => {
  return UserModel.find(buildPendingApprovalUsersFilterForAdmin())
    .select(USER_SAFE_FIELDS)
    .sort({ createdAt: -1 })
    .lean();
};

export const updateUserApprovalByAdmin = async (
  userId: string,
  isApproved: boolean,
): Promise<ServiceResult<null, NotificationPayload | null>> => {
  assertValidApprovalStatusInput(isApproved);

  const user = await UserModel.findById(userId);
  assertEntityExists(
    user,
    APPLICATION_MESSAGES.AUTH.USER_NOT_FOUND,
    APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND,
  );

  if (!user.isEmailVerified) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.AUTH.EMAIL_NOT_VERIFIED_FOR_APPROVAL,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  if (user.isApproved === isApproved) {
    return {
      data: null,
      notificationPayload: null,
    };
  }

  user.isApproved = isApproved;
  await user.save();

  return {
    data: null,
    notificationPayload: buildUserApprovalNotificationPayload(isApproved, user),
  };
};

export const listApprovedInterviewersForSelection = async ({
  page = INTERVIEWER_DIRECTORY_DEFAULT_PAGE,
  limit = INTERVIEWER_DIRECTORY_DEFAULT_LIMIT,
}: InterviewerDirectoryQuery = {}) => {
  const normalizedPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const normalizedLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10;
  const filter = buildApprovedInterviewersFilterForSelection();
  const total = await UserModel.countDocuments(filter);
  const interviewers = await UserModel.find(filter)
    .select(USER_SELECTION_FIELDS)
    .sort({ name: 1 })
    .skip((normalizedPage - 1) * normalizedLimit)
    .limit(normalizedLimit)
    .lean();

  return {
    data: interviewers,
    pagination: {
      page: normalizedPage,
      limit: normalizedLimit,
      total,
      totalPages: total > 0 ? Math.ceil(total / normalizedLimit) : 1,
    },
  };
};
