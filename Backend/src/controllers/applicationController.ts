import type { Request, Response } from 'express';
import { updateApplicationStatus as updateApplicationStatusService } from '../services/application/applicationStatusService';
import { listApplicationsForHrJob as getApplicationsForHrJobService } from '../services/application/applicationQueryService';
import { sendNotification } from '../services/notification/notificationDispatcher';
import { APPLICATION_CONSTANTS } from '../utils/constants/applicationConstants';
import { sendSuccessResponse } from '../utils/http/responseHelpers';
import { getAuthenticatedUserId } from './helpers/requestAuthHelpers';
import { APPLICATION_MESSAGES } from '../utils/messages/applicationMessages';
import type {
  ApplicationListQuery,
  UpdateApplicationStatusBody,
} from '../utils/types/applicationTypes';
import type { AuthenticatedRequest } from '../utils/types/authTypes';

export const updateApplicationStatus = async (
  req: Request<{ applicationId: string }, unknown, UpdateApplicationStatusBody> &
    AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const { applicationId } = req.params;
  const { newApplicationStatus } = req.body;
  const updateResult = await updateApplicationStatusService(applicationId, newApplicationStatus);
  await sendNotification(updateResult.notificationPayload);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.APPLICATION.STATUS_UPDATED_SUCCESS,
  });
};

export const getApplicationsForHrJob = async (
  req: Request<{ jobId: string }, unknown, unknown, ApplicationListQuery> & AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const { jobId } = req.params;
  const applications = await getApplicationsForHrJobService(jobId, authenticatedUserId, req.query);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.JOB.APPLICATIONS_FETCHED_SUCCESS,
    data: applications.data,
    pagination: applications.pagination,
  });
};
