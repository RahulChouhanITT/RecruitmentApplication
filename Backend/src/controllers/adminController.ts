import type { Request, Response } from 'express';
import { APPLICATION_CONSTANTS } from '../utils/constants/applicationConstants';
import { sendSuccessResponse } from '../utils/http/responseHelpers';
import {
  listApprovedInterviewersForSelection as getApprovedInterviewersService,
  listPendingApprovalUsersForAdmin as getPendingApprovalUsersService,
  updateUserApprovalByAdmin as updateUserApprovalService,
} from '../services/auth/authApprovalService';
import { sendNotification } from '../services/notification/notificationDispatcher';
import { APPLICATION_MESSAGES } from '../utils/messages/applicationMessages';
import type {
  AuthenticatedRequest,
  UpdateApprovalStatusRequestBody,
} from '../utils/types/authTypes';

export const getPendingApprovalUsers = async (
  _req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const pendingApprovalUsers = await getPendingApprovalUsersService();

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.AUTH.PENDING_APPROVAL_USERS_FETCHED,
    data: pendingApprovalUsers,
  });
};

export const updateUserApprovalStatus = async (
  req: Request<{ userId: string }, unknown, UpdateApprovalStatusRequestBody>,
  res: Response,
): Promise<void> => {
  const { userId } = req.params;
  const { isApproved } = req.body;
  const approvalResult = await updateUserApprovalService(userId, isApproved);
  await sendNotification(approvalResult.notificationPayload);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.AUTH.APPROVAL_STATUS_UPDATED,
  });
};

export const getApprovedInterviewers = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const page =
    typeof req.query.page === 'string' ? Number.parseInt(req.query.page, 10) : undefined;
  const limit =
    typeof req.query.limit === 'string' ? Number.parseInt(req.query.limit, 10) : undefined;
  const approvedInterviewers = await getApprovedInterviewersService({ page, limit });

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.AUTH.INTERVIEWERS_FETCHED,
    data: approvedInterviewers.data,
    pagination: approvedInterviewers.pagination,
  });
};
