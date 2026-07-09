import type { Request, Response } from 'express';
import {
  activateJob as activateJobService,
  closeJob as closeJobService,
  createJob as createJobService,
  updateJob as updateJobService,
} from '../services/job/jobMutationService';
import { getJobsForHr as getJobsForHrService } from '../services/job/jobQueryService';
import { sendSuccessResponse } from '../utils/http/responseHelpers';
import { getAuthenticatedUserId } from './helpers/requestAuthHelpers';
import { APPLICATION_CONSTANTS } from '../utils/constants/applicationConstants';
import { APPLICATION_MESSAGES } from '../utils/messages/applicationMessages';
import type { AuthenticatedRequest } from '../utils/types/authTypes';
import type {
  CreateJobRequestBody,
  JobListQuery,
  UpdateJobRequestBody,
} from '../utils/types/jobTypes';

export const createJob = async (
  req: AuthenticatedRequest & Request<unknown, unknown, CreateJobRequestBody>,
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const createJobPayload = req.body;
  await createJobService(createJobPayload, authenticatedUserId);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.CREATED,
    message: APPLICATION_MESSAGES.JOB.CREATED_SUCCESS,
  });
};

export const updateJob = async (
  req: AuthenticatedRequest & Request<{ jobId: string }, unknown, UpdateJobRequestBody>,
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const { jobId } = req.params;
  const updateJobPayload = req.body;
  await updateJobService(jobId, updateJobPayload, authenticatedUserId);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.JOB.UPDATED_SUCCESS,
  });
};

export const closeJob = async (
  req: AuthenticatedRequest & Request<{ jobId: string }>,
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const { jobId } = req.params;
  await closeJobService(jobId, authenticatedUserId);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.JOB.CLOSED_SUCCESS,
  });
};

export const activateJob = async (
  req: AuthenticatedRequest & Request<{ jobId: string }>,
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const { jobId } = req.params;
  await activateJobService(jobId, authenticatedUserId);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.JOB.ACTIVATED_SUCCESS,
  });
};

export const getJobsForHr = async (
  req: AuthenticatedRequest & Request<unknown, unknown, unknown, JobListQuery>,
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const jobs = await getJobsForHrService(authenticatedUserId, req.query);
  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.JOB.HR_FETCHED_SUCCESS,
    data: jobs.data,
    pagination: jobs.pagination,
  });
};
