import type { Request, Response } from "express";
import {
  activateJob,
  applyForJob,
  closeJob,
  createJob,
  getApplicationsForHrJob,
  getAllActiveJobsForCandidate,
  getAppliedJobsForCandidate,
  getJobsForHr,
  updateJob,
} from "../services/jobService";
import { APPLICATION_CONSTANTS } from "../utils/constants/applicationConstants";
import { sendSuccessResponse } from "../utils/helpers";
import { APPLICATION_MESSAGES } from "../utils/messages/applicationMessages";
import type { AuthenticatedRequest } from "../utils/types/authTypes";
import type { CreateJobRequestBody, JobListQuery, UpdateJobRequestBody } from "../utils/types/jobTypes";

export const createJobHandler = async (
  req: AuthenticatedRequest & Request<unknown, unknown, CreateJobRequestBody>,
  res: Response
): Promise<void> => {
  const job = await createJob(req.body, req.authenticatedUserId as string);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.CREATED,
    message: APPLICATION_MESSAGES.JOB.CREATED_SUCCESS,
    data: job,
  });
};

export const updateJobHandler = async (
  req: AuthenticatedRequest & Request,
  res: Response
): Promise<void> => {
  const { jobId } = req.params as { jobId: string };
  const requestBody = req.body as UpdateJobRequestBody;
  const job = await updateJob(jobId, requestBody, req.authenticatedUserId as string);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.JOB.UPDATED_SUCCESS,
    data: job,
  });
};

export const closeJobHandler = async (
  req: AuthenticatedRequest & Request,
  res: Response
): Promise<void> => {
  const { jobId } = req.params as { jobId: string };
  const job = await closeJob(jobId, req.authenticatedUserId as string);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.JOB.CLOSED_SUCCESS,
    data: job,
  });
};

export const activateJobHandler = async (
  req: AuthenticatedRequest & Request,
  res: Response
): Promise<void> => {
  const { jobId } = req.params as { jobId: string };
  const job = await activateJob(jobId, req.authenticatedUserId as string);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.JOB.ACTIVATED_SUCCESS,
    data: job,
  });
};

export const getJobsForCandidateHandler = async (req: Request<unknown, unknown, unknown, JobListQuery>, res: Response): Promise<void> => {
  const jobs = await getAllActiveJobsForCandidate(req.query);
  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.JOB.FETCHED_SUCCESS,
    data: jobs.data,
    pagination: jobs.pagination,
  });
};

export const getJobsForHrHandler = async (
  req: AuthenticatedRequest & Request<unknown, unknown, unknown, JobListQuery>,
  res: Response
): Promise<void> => {
  const jobs = await getJobsForHr(req.authenticatedUserId as string, req.query);
  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.JOB.HR_FETCHED_SUCCESS,
    data: jobs.data,
    pagination: jobs.pagination,
  });
};

export const applyForJobHandler = async (
  req: AuthenticatedRequest & Request,
  res: Response
): Promise<void> => {
  const { jobId } = req.params as { jobId: string };
  const application = await applyForJob(jobId, req.authenticatedUserId as string);
  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.CREATED,
    message: APPLICATION_MESSAGES.JOB.APPLIED_SUCCESS,
    data: application,
  });
};

export const getAppliedJobsHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const applications = await getAppliedJobsForCandidate(req.authenticatedUserId as string);
  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.JOB.APPLIED_FETCHED_SUCCESS,
    data: applications,
  });
};

export const getApplicationsForHrJobHandler = async (
  req: AuthenticatedRequest & Request,
  res: Response
): Promise<void> => {
  const { jobId } = req.params as { jobId: string };
  const applications = await getApplicationsForHrJob(jobId, req.authenticatedUserId as string);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.JOB.APPLICATIONS_FETCHED_SUCCESS,
    data: applications,
  });
};
