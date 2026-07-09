import type { Request, Response } from 'express';
import { submitJobApplication as applyForJobService } from '../services/application/applicationSubmissionService';
import { getAppliedJobsForCandidate as getAppliedJobsForCandidateService } from '../services/application/applicationQueryService';
import {
  saveUploadedCandidateResume as saveUploadedCandidateResumeService,
  uploadCandidateResume as uploadCandidateResumeService,
} from '../services/candidate/candidateResumeUploadService';
import { deleteCandidateResume as deleteCandidateResumeService } from '../services/candidate/candidateResumeDeleteService';
import { getCandidateInterviews as getCandidateInterviewsService } from '../services/interview/interviewQueryService';
import { getAllActiveJobsForCandidate as getAllActiveJobsForCandidateService } from '../services/job/jobQueryService';
import { sendNotification } from '../services/notification/notificationDispatcher';
import { processResumeIntegration } from '../services/integration/resumeStorageIntegrationOrchestrator';
import { sendSuccessResponse } from '../utils/http/responseHelpers';
import { getAuthenticatedUserId } from './helpers/requestAuthHelpers';
import { APPLICATION_CONSTANTS } from '../utils/constants/applicationConstants';
import { APPLICATION_MESSAGES } from '../utils/messages/applicationMessages';
import type { AuthenticatedRequest } from '../utils/types/authTypes';
import type { UploadedResumeFile } from '../utils/types/candidateTypes';
import type { JobListQuery } from '../utils/types/jobTypes';
import type { ApplicationListQuery, InterviewListQuery } from '../utils/types/applicationTypes';

export const uploadResume = async (
  req: AuthenticatedRequest & Request & { file?: UploadedResumeFile },
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const uploadResult = await uploadCandidateResumeService(authenticatedUserId, req.file);

  if (uploadResult.integrationPayload?.kind === 'uploadResume') {
    const uploadedAsset = await processResumeIntegration(uploadResult.integrationPayload);
    if (uploadedAsset) {
      const saveResult = await saveUploadedCandidateResumeService(
        authenticatedUserId,
        uploadedAsset,
      );
      if (saveResult.integrationPayload?.kind === 'deleteResume') {
        await processResumeIntegration(saveResult.integrationPayload);
      }
    }
  }

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.CANDIDATE.RESUME_UPLOADED,
  });
};

export const deleteResume = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const deleteResult = await deleteCandidateResumeService(authenticatedUserId);
  if (deleteResult.integrationPayload?.kind === 'deleteResume') {
    await processResumeIntegration(deleteResult.integrationPayload);
  }

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.CANDIDATE.RESUME_DELETED,
  });
};

export const applyForJob = async (
  req: AuthenticatedRequest & Request<{ jobId: string }>,
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const { jobId } = req.params;
  const applicationResult = await applyForJobService(jobId, authenticatedUserId);
  await sendNotification(applicationResult.notificationPayload);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.CREATED,
    message: APPLICATION_MESSAGES.JOB.APPLIED_SUCCESS,
  });
};

export const getJobsForCandidate = async (
  req: Request<unknown, unknown, unknown, JobListQuery>,
  res: Response,
): Promise<void> => {
  const jobs = await getAllActiveJobsForCandidateService(req.query);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.JOB.FETCHED_SUCCESS,
    data: jobs.data,
    pagination: jobs.pagination,
  });
};

export const getMyApplications = async (
  req: AuthenticatedRequest & Request<unknown, unknown, unknown, ApplicationListQuery>,
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const applications = await getAppliedJobsForCandidateService(authenticatedUserId, req.query);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.JOB.APPLIED_FETCHED_SUCCESS,
    data: applications.data,
    pagination: applications.pagination,
  });
};

export const getMyInterviews = async (
  req: AuthenticatedRequest & Request<unknown, unknown, unknown, InterviewListQuery>,
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const interviews = await getCandidateInterviewsService(authenticatedUserId, req.query);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.INTERVIEW.CANDIDATE_FETCHED_SUCCESS,
    data: interviews.data,
    pagination: interviews.pagination,
  });
};
