import { Types } from 'mongoose';
import { ApplicationModel, type IApplication } from '../../models/applicationModel';
import { JobModel } from '../../models/jobModel';
import { UserModel } from '../../models/userModel';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { ApplicationError } from '../../utils/errors/applicationError';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';
import { emitApplicationCreated } from '../../events/eventBus';
import {
  APPLICATION_STATUS_VALUES,
  buildJobApplicationConfirmationNotificationPayload,
  buildJobApplicationFilter,
} from './helpers/applicationServiceHelpers';
import {
  JOB_APPLICATION_CANDIDATE_FIELDS,
  JOB_APPLICATION_JOB_FIELDS,
} from '../../utils/constants';
import type { NotificationPayload, ServiceResult } from '../../utils/types';

type JobSummary = { _id: Types.ObjectId; title: string; isActive?: boolean };
type CandidateNotificationUser = { name: string; email?: string };

const fetchJobForApplicationSubmission = async (jobId: string) => {
  return JobModel.findById(jobId).select(JOB_APPLICATION_JOB_FIELDS).lean<JobSummary | null>();
};

const findExistingJobApplication = async (jobId: string, candidateUserId: string) => {
  return ApplicationModel.findOne(buildJobApplicationFilter(jobId, candidateUserId)).lean();
};

const createJobApplicationRecord = async (jobId: string, candidateUserId: string) => {
  return ApplicationModel.create({
    jobId,
    candidateId: new Types.ObjectId(candidateUserId),
    status: APPLICATION_STATUS_VALUES.APPLIED,
  });
};

const fetchCandidateNotificationUser = async (candidateUserId: Types.ObjectId | string) => {
  return UserModel.findById(candidateUserId)
    .select(JOB_APPLICATION_CANDIDATE_FIELDS)
    .lean<CandidateNotificationUser | null>();
};

export const submitJobApplication = async (
  jobId: string,
  candidateUserId: string,
): Promise<ServiceResult<IApplication, NotificationPayload>> => {
  const [job, existingApplication] = await Promise.all([
    fetchJobForApplicationSubmission(jobId),
    findExistingJobApplication(jobId, candidateUserId),
  ]);

  if (!job || !job.isActive) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.APPLICATION.JOB_NOT_AVAILABLE_FOR_APPLICATION,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  if (existingApplication) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.JOB.ALREADY_APPLIED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.CONFLICT,
    );
  }

  const application = await createJobApplicationRecord(jobId, candidateUserId);
  const candidate = await fetchCandidateNotificationUser(candidateUserId);

  if (candidate) {
    emitApplicationCreated({
      applicationId: application._id.toString(),
      jobId,
      candidateId: candidateUserId,
      candidateName: candidate.name,
      jobTitle: job.title,
    });
  }

  return {
    data: application,
    notificationPayload: buildJobApplicationConfirmationNotificationPayload(candidate, job.title),
  };
};
