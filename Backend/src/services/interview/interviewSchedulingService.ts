import mongoose, { ClientSession, Types } from 'mongoose';
import { ApplicationModel, type IApplication } from '../../models/applicationModel';
import { InterviewModel, INTERVIEW_STATUSES, type IInterview } from '../../models/interviewModel';
import { JobModel } from '../../models/jobModel';
import { UserModel } from '../../models/userModel';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { ApplicationError } from '../../utils/errors/applicationError';
import { assertEntityExists } from '../../utils/common/entityHelpers';
import { toIdString } from '../../utils/common/idHelpers';
import { trimOrEmpty, trimValue } from '../../utils/common/stringHelpers';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';
import { emitInterviewUpdated } from '../../events/eventBus';
import {
  type GoogleMeetIntegrationPayload,
  type InterviewMeetingDetails,
  type InterviewSchedulingContext,
  type InterviewerUser,
  type NotificationPayload,
  type ScheduleInterviewInput,
  type ServiceResult,
} from '../../utils/types';
import { APPLICATION_STATUS_VALUES } from '../application/helpers/applicationServiceHelpers';
import { INTERVIEWER_SELECTION_FIELDS, INTERVIEW_CANDIDATE_FIELDS } from '../../utils/constants';
import {
  buildInterviewInviteNotificationPayload,
  buildInterviewMeetingPayload,
  buildInterviewSchedulingResult,
  requireInterviewDateTime,
} from './helpers/interviewServiceHelpers';

const [interviewStatusScheduled] = INTERVIEW_STATUSES;

const INTERVIEW_STATUS_VALUES = {
  SCHEDULED: interviewStatusScheduled,
} as const;

type ScheduleInterviewPlanData = {
  candidateId: string;
  interviewerId: string;
};

type FinalizedInterviewScheduleData = {
  interview: IInterview;
  candidateId: string;
  interviewerId: string;
};

type InterviewInviteNotificationPayload = Extract<NotificationPayload, { kind: 'interviewInvite' }>;

const fetchHrAccessibleApplicationContext = async (
  applicationId: string,
  session?: ClientSession,
) => {
  const applicationEntity = await ApplicationModel.findById(applicationId).session(session ?? null);
  assertEntityExists(applicationEntity, APPLICATION_MESSAGES.APPLICATION.NOT_FOUND);

  const jobEntity = await JobModel.findById(applicationEntity.jobId).session(session ?? null);
  assertEntityExists(jobEntity, APPLICATION_MESSAGES.JOB.NOT_FOUND);

  return { applicationEntity, jobEntity };
};

const findInterviewerByIdForScheduling = async (interviewerId: string, session?: ClientSession) => {
  return UserModel.findById(interviewerId)
    .select(INTERVIEWER_SELECTION_FIELDS)
    .session(session ?? null);
};

const findInterviewerByNameForScheduling = async (
  interviewerName: string,
  session?: ClientSession,
) => {
  return UserModel.findOne({
    role: APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER,
    name: interviewerName,
  })
    .select(INTERVIEWER_SELECTION_FIELDS)
    .session(session ?? null);
};

const resolveInterviewerForScheduling = async (
  scheduleInterviewInput: ScheduleInterviewInput,
  session?: ClientSession,
): Promise<InterviewerUser> => {
  const normalizedInterviewerId = trimValue(scheduleInterviewInput.interviewerId);
  if (normalizedInterviewerId) {
    const interviewerById = await findInterviewerByIdForScheduling(
      normalizedInterviewerId,
      session,
    );
    if (interviewerById?.role === APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER) {
      return {
        _id: interviewerById._id as Types.ObjectId,
        name: interviewerById.name,
        email: interviewerById.email,
        role: interviewerById.role,
      };
    }
  }

  const normalizedInterviewerName = trimValue(scheduleInterviewInput.interviewerName);
  if (normalizedInterviewerName) {
    const interviewerByName = await findInterviewerByNameForScheduling(
      normalizedInterviewerName,
      session,
    );
    if (interviewerByName) {
      return {
        _id: interviewerByName._id as Types.ObjectId,
        name: interviewerByName.name,
        email: interviewerByName.email,
        role: interviewerByName.role,
      };
    }
  }

  throw new ApplicationError(
    APPLICATION_MESSAGES.INTERVIEW.INTERVIEWER_REQUIRED,
    APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
  );
};

const fetchInterviewSchedulingContext = async (
  applicationId: string,
  scheduleInterviewInput: ScheduleInterviewInput,
  session?: ClientSession,
): Promise<InterviewSchedulingContext> => {
  const { applicationEntity, jobEntity } = await fetchHrAccessibleApplicationContext(
    applicationId,
    session,
  );
  const [candidate, interviewer] = await Promise.all([
    UserModel.findById(applicationEntity.candidateId)
      .select(INTERVIEW_CANDIDATE_FIELDS)
      .session(session ?? null),
    resolveInterviewerForScheduling(scheduleInterviewInput, session),
  ]);

  assertEntityExists(candidate, APPLICATION_MESSAGES.AUTH.USER_NOT_FOUND);

  const { interviewDate, interviewTime } = requireInterviewDateTime(scheduleInterviewInput);

  return {
    applicationEntity,
    jobEntity,
    candidate,
    interviewer,
    interviewDate,
    interviewTime,
    notes: trimOrEmpty(scheduleInterviewInput.notes),
  };
};

const updateScheduledInterviewRecord = async (
  interviewSchedulingContext: InterviewSchedulingContext,
  hrUserId: string,
  meetingLink: string,
) => {
  return InterviewModel.findOneAndUpdate(
    { applicationId: interviewSchedulingContext.applicationEntity._id as Types.ObjectId },
    {
      applicationId: interviewSchedulingContext.applicationEntity._id,
      jobId: interviewSchedulingContext.jobEntity._id,
      candidateId: interviewSchedulingContext.candidate._id,
      interviewerId: interviewSchedulingContext.interviewer._id,
      interviewerName: interviewSchedulingContext.interviewer.name,
      interviewDate: interviewSchedulingContext.interviewDate,
      interviewTime: interviewSchedulingContext.interviewTime,
      meetingLink,
      notes: interviewSchedulingContext.notes,
      status: INTERVIEW_STATUS_VALUES.SCHEDULED,
      feedbackStatus: APPLICATION_CONSTANTS.FEEDBACK_STATUSES[0],
      createdBy: new Types.ObjectId(hrUserId),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

const updateApplicationStatusAfterInterviewScheduling = async (
  applicationEntity: IApplication,
): Promise<void> => {
  applicationEntity.status = APPLICATION_STATUS_VALUES.INTERVIEW_SCHEDULED;
  await applicationEntity.save();
};

export const scheduleApplicationInterview = async (
  applicationId: string,
  scheduleInterviewInput: ScheduleInterviewInput,
): Promise<ServiceResult<ScheduleInterviewPlanData, null, GoogleMeetIntegrationPayload>> => {
  const interviewSchedulingContext = await fetchInterviewSchedulingContext(
    applicationId,
    scheduleInterviewInput,
  );
  const meetingPayload = buildInterviewMeetingPayload(
    interviewSchedulingContext.jobEntity.title,
    interviewSchedulingContext.interviewDate,
    interviewSchedulingContext.interviewTime,
    interviewSchedulingContext.notes,
  );

  return {
    data: {
      candidateId: toIdString(interviewSchedulingContext.candidate._id),
      interviewerId: toIdString(interviewSchedulingContext.interviewer._id),
    },
    integrationPayload: meetingPayload,
  };
};

export const finalizeApplicationInterviewSchedule = async (
  applicationId: string,
  hrUserId: string,
  scheduleInterviewInput: ScheduleInterviewInput,
  meetingLink: string,
): Promise<ServiceResult<FinalizedInterviewScheduleData, InterviewInviteNotificationPayload>> => {
  const currentInterviewSchedulingContext = await fetchInterviewSchedulingContext(
    applicationId,
    scheduleInterviewInput,
  );
  const currentMeetingPayload = buildInterviewMeetingPayload(
    currentInterviewSchedulingContext.jobEntity.title,
    currentInterviewSchedulingContext.interviewDate,
    currentInterviewSchedulingContext.interviewTime,
    currentInterviewSchedulingContext.notes,
  );
  const currentMeetingDetails = {
    meetingLink,
    startDateTime: currentMeetingPayload.startDateTime,
    endDateTime: currentMeetingPayload.endDateTime,
  };
  const currentScheduledInterview = await updateScheduledInterviewRecord(
    currentInterviewSchedulingContext,
    hrUserId,
    currentMeetingDetails.meetingLink,
  );
  await updateApplicationStatusAfterInterviewScheduling(
    currentInterviewSchedulingContext.applicationEntity,
  );

  const interviewSchedulingContext = currentInterviewSchedulingContext;
  const meetingDetails = currentMeetingDetails;
  const scheduledInterview = currentScheduledInterview;

  const schedulingResult = buildInterviewSchedulingResult(
    interviewSchedulingContext,
    scheduledInterview,
    meetingDetails,
  );

  emitInterviewUpdated({
    interviewId: toIdString(schedulingResult.scheduledInterview._id),
    applicationId: toIdString(schedulingResult.interviewSchedulingContext.applicationEntity._id),
    candidateId: toIdString(schedulingResult.interviewSchedulingContext.candidate._id),
    interviewerId: toIdString(schedulingResult.interviewSchedulingContext.interviewer._id),
    candidateName: schedulingResult.interviewSchedulingContext.candidate.name,
    interviewerName: schedulingResult.interviewSchedulingContext.interviewer.name,
    jobTitle: schedulingResult.interviewSchedulingContext.jobEntity.title,
    interviewDate: schedulingResult.interviewSchedulingContext.interviewDate,
    interviewTime: schedulingResult.interviewSchedulingContext.interviewTime,
  });

  return {
    data: {
      interview: schedulingResult.scheduledInterview,
      candidateId: toIdString(schedulingResult.interviewSchedulingContext.candidate._id),
      interviewerId: toIdString(schedulingResult.interviewSchedulingContext.interviewer._id),
    },
    notificationPayload: buildInterviewInviteNotificationPayload(schedulingResult),
  };
};
