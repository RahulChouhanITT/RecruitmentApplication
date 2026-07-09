import mongoose, { ClientSession, Types } from 'mongoose';
import { ApplicationModel, type IApplication } from '../../models/applicationModel';
import { FeedbackModel } from '../../models/feedbackModel';
import { InterviewModel, INTERVIEW_STATUSES } from '../../models/interviewModel';
import { JobModel } from '../../models/jobModel';
import { UserModel } from '../../models/userModel';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { ApplicationError } from '../../utils/errors/applicationError';
import { assertEntityExists } from '../../utils/common/entityHelpers';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';
import { emitApplicationStatusUpdated } from '../../events/eventBus';
import type { ApplicationStatus } from '../../utils/types/applicationTypes';
import {
  APPLICATION_STATUS_VALUES,
  assertApplicationStatusChangeAllowed,
  buildApplicationStatusNotificationPayload,
  type ApplicationStatusEmailNotification,
  normalizeApplicationStatus,
} from './helpers/applicationServiceHelpers';
import { JOB_APPLICATION_CANDIDATE_FIELDS } from '../../utils/constants';
import type { NotificationPayload, ServiceResult } from '../../utils/types';

const [interviewStatusScheduled] = INTERVIEW_STATUSES;
type JobSummary = { _id: Types.ObjectId; title: string };
type CandidateNotificationUser = { name: string; email?: string };
type ApplicationStatusUpdateEventPayload = {
  applicationId: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  status: ApplicationStatus;
};

const fetchHrAccessibleApplicationContext = async (
  applicationId: string,
  session?: ClientSession,
) => {
  const applicationEntity = await ApplicationModel.findById(applicationId).session(session ?? null);
  assertEntityExists(applicationEntity, APPLICATION_MESSAGES.APPLICATION.NOT_FOUND);

  const jobEntity = await JobModel.findById(applicationEntity.jobId)
    .session(session ?? null)
    .lean<JobSummary | null>();
  assertEntityExists(jobEntity, APPLICATION_MESSAGES.JOB.NOT_FOUND);

  return { applicationEntity, jobEntity };
};

const findActiveScheduledInterview = async (
  applicationId: Types.ObjectId,
  session?: ClientSession,
) => {
  return InterviewModel.findOne({
    applicationId,
    status: interviewStatusScheduled,
  })
    .session(session ?? null)
    .lean();
};

const fetchCandidateNotificationUser = async (
  candidateUserId: Types.ObjectId | string,
  session?: ClientSession,
) => {
  return UserModel.findById(candidateUserId)
    .select(JOB_APPLICATION_CANDIDATE_FIELDS)
    .session(session ?? null)
    .lean<CandidateNotificationUser | null>();
};

const findInterviewForFinalDecision = async (
  applicationId: Types.ObjectId,
  session?: ClientSession,
) => {
  return InterviewModel.findOne({ applicationId }).session(session ?? null);
};

const findFeedbackForInterview = async (interviewId: Types.ObjectId, session?: ClientSession) => {
  return FeedbackModel.findOne({ interviewId })
    .session(session ?? null)
    .lean();
};

const assertNoBlockingScheduledInterview = async (
  applicationId: Types.ObjectId,
  nextStatus: ApplicationStatus,
  session?: ClientSession,
): Promise<void> => {
  const activeScheduledInterview = await findActiveScheduledInterview(applicationId, session);

  if (activeScheduledInterview && nextStatus !== APPLICATION_STATUS_VALUES.INTERVIEW_SCHEDULED) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.APPLICATION.CANCEL_INTERVIEW_BEFORE_STATUS_CHANGE,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }
};

const handleFinalDecisionRequirements = async (
  applicationId: Types.ObjectId,
  nextStatus: ApplicationStatus,
  session?: ClientSession,
): Promise<void> => {
  if (
    nextStatus !== APPLICATION_STATUS_VALUES.HIRED &&
    nextStatus !== APPLICATION_STATUS_VALUES.REJECTED
  ) {
    return;
  }

  const interview = await findInterviewForFinalDecision(applicationId, session);
  assertEntityExists(interview, APPLICATION_MESSAGES.INTERVIEW.NOT_FOUND_FOR_APPLICATION);

  const feedback = await findFeedbackForInterview(interview._id, session);
  if (!feedback) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.APPLICATION.FEEDBACK_REQUIRED_FOR_FINAL_DECISION,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  if (interview.feedbackStatus === APPLICATION_CONSTANTS.FEEDBACK_STATUSES[0]) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.APPLICATION.FEEDBACK_REVIEW_PENDING,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  interview.feedbackStatus = APPLICATION_CONSTANTS.FEEDBACK_STATUSES[2];
  await interview.save({ session });
};

export const updateApplicationStatus = async (
  applicationId: string,
  status: string,
): Promise<ServiceResult<IApplication, NotificationPayload | null>> => {
  const normalizedStatus = normalizeApplicationStatus(status);
  let emailNotification: ApplicationStatusEmailNotification | null = null;
  let updatedApplication: IApplication | null = null;
  let statusUpdateEventPayload: ApplicationStatusUpdateEventPayload | null = null;

  const { applicationEntity, jobEntity } = await fetchHrAccessibleApplicationContext(
    applicationId,
  );

  await assertNoBlockingScheduledInterview(applicationEntity._id, normalizedStatus);
  await assertApplicationStatusChangeAllowed(applicationEntity.status, normalizedStatus);

  const candidate = await fetchCandidateNotificationUser(
    applicationEntity.candidateId,
  );
  assertEntityExists(candidate, APPLICATION_MESSAGES.AUTH.USER_NOT_FOUND);

  await handleFinalDecisionRequirements(applicationEntity._id, normalizedStatus);

  applicationEntity.status = normalizedStatus;
  await applicationEntity.save();
  updatedApplication = applicationEntity;

  emailNotification = {
    candidateEmail: candidate.email,
    candidateName: candidate.name,
    jobTitle: jobEntity.title,
    applicationStatus: normalizedStatus,
  };
  statusUpdateEventPayload = {
    applicationId: applicationEntity._id.toString(),
    candidateId: applicationEntity.candidateId.toString(),
    candidateName: candidate.name,
    jobTitle: jobEntity.title,
    status: normalizedStatus,
  };

  assertEntityExists(updatedApplication, APPLICATION_MESSAGES.APPLICATION.NOT_FOUND);
  if (statusUpdateEventPayload) {
    emitApplicationStatusUpdated(statusUpdateEventPayload);
  }

  return {
    data: updatedApplication,
    notificationPayload: buildApplicationStatusNotificationPayload(emailNotification),
  };
};
