import type { IInterview } from '../../../models/interviewModel';
import { INTERVIEW_STATUSES } from '../../../models/interviewModel';
import { APPLICATION_CONSTANTS } from '../../../utils/constants/applicationConstants';
import { ApplicationError } from '../../../utils/errors/applicationError';
import { APPLICATION_MESSAGES } from '../../../utils/messages/applicationMessages';
import { toIdString } from '../../../utils/common/idHelpers';
import { requireTrimmedValue, trimOrEmpty } from '../../../utils/common/stringHelpers';
import type {
  CandidateInterviewLean,
  CandidateInterviewResult,
  HrInterviewLean,
  InterviewMeetingDetails,
  InterviewSchedulingContext,
  InterviewSchedulingResult,
  InterviewerInterviewLean,
  InterviewerInterviewResult,
  PopulatedApplication,
  PopulatedJob,
} from '../../../utils/types/applicationTypes';
import type { PopulatedCandidate } from '../../../utils/types/candidateTypes';
import type { NotificationPayload } from '../../../utils/types/serviceTypes';
import { APPLICATION_STATUS_VALUES } from '../../application/helpers/applicationServiceHelpers';
import { resolveInterviewFeedbackStatus } from './interviewHelpers';

const [, interviewStatusCompleted, interviewStatusCancelled] = INTERVIEW_STATUSES;

const pad = (value: number): string => String(value).padStart(2, '0');

export const generateDailyInterviewSlots = (): string[] => {
  const slots: string[] = [];

  for (
    let hour = APPLICATION_CONSTANTS.INTERVIEW.WORKDAY_START_HOUR;
    hour < APPLICATION_CONSTANTS.INTERVIEW.WORKDAY_END_HOUR;
    hour += 1
  ) {
    slots.push(`${pad(hour)}:00`);
    slots.push(`${pad(hour)}:${pad(APPLICATION_CONSTANTS.INTERVIEW.SLOT_INTERVAL_MINUTES)}`);
  }

  return slots;
};

export const toInterviewDateTimeIso = (
  interviewDate: string,
  interviewTime: string,
): { startDateTime: string; endDateTime: string } => {
  const start = new Date(`${interviewDate}T${interviewTime}:00+05:30`);

  if (Number.isNaN(start.getTime())) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.INTERVIEW.INVALID_DATE_TIME,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  const end = new Date(start.getTime() + 60 * 60 * 1000);

  return {
    startDateTime: start.toISOString(),
    endDateTime: end.toISOString(),
  };
};

export const requireInterviewDateTime = (interviewSchedulingInput: {
  interviewDate: string;
  interviewTime: string;
}) => {
  const interviewDate = requireTrimmedValue(
    interviewSchedulingInput.interviewDate,
    APPLICATION_MESSAGES.INTERVIEW.DATE_TIME_REQUIRED,
  );
  const interviewTime = requireTrimmedValue(
    interviewSchedulingInput.interviewTime,
    APPLICATION_MESSAGES.INTERVIEW.DATE_TIME_REQUIRED,
  );

  return { interviewDate, interviewTime };
};

export const buildInterviewMeetingPayload = (
  jobTitle: string,
  interviewDate: string,
  interviewTime: string,
  notes: string,
) => {
  const { startDateTime, endDateTime } = toInterviewDateTimeIso(interviewDate, interviewTime);

  return {
    kind: 'googleMeetEvent' as const,
    summary: `Interview - ${jobTitle}`,
    description: trimOrEmpty(notes) || APPLICATION_CONSTANTS.INTERVIEW.DEFAULT_DESCRIPTION,
    startDateTime,
    endDateTime,
  };
};

export const buildInterviewSchedulingResult = (
  interviewSchedulingContext: InterviewSchedulingContext | null,
  scheduledInterview: IInterview | null,
  meetingDetails: InterviewMeetingDetails | null,
): InterviewSchedulingResult => {
  if (!interviewSchedulingContext || !scheduledInterview || !meetingDetails) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    );
  }

  return {
    interviewSchedulingContext,
    scheduledInterview,
    meetingDetails,
  };
};

export const buildInterviewInviteNotificationPayload = (
  schedulingResult: InterviewSchedulingResult,
): Extract<NotificationPayload, { kind: 'interviewInvite' }> => {
  return {
    kind: 'interviewInvite',
    candidateEmail: schedulingResult.interviewSchedulingContext.candidate.email,
    candidateName: schedulingResult.interviewSchedulingContext.candidate.name,
    interviewerEmail: schedulingResult.interviewSchedulingContext.interviewer.email,
    interviewerName: schedulingResult.interviewSchedulingContext.interviewer.name,
    jobTitle: schedulingResult.interviewSchedulingContext.jobEntity.title,
    interviewDate: schedulingResult.scheduledInterview.interviewDate,
    interviewTime: schedulingResult.scheduledInterview.interviewTime,
    meetingLink: schedulingResult.scheduledInterview.meetingLink,
    startDateTimeIso: schedulingResult.meetingDetails.startDateTime,
    endDateTimeIso: schedulingResult.meetingDetails.endDateTime,
    notes: trimOrEmpty(schedulingResult.scheduledInterview.notes),
  };
};

export const resolveCandidateInterviewResult = (
  applicationStatus: string | undefined,
): CandidateInterviewResult => {
  const normalizedStatus = (applicationStatus ?? APPLICATION_CONSTANTS.EMPTY_STRING).toUpperCase();

  if (normalizedStatus === APPLICATION_STATUS_VALUES.HIRED) {
    return APPLICATION_CONSTANTS.INTERVIEW_RESULTS.PASSED;
  }

  if (normalizedStatus === APPLICATION_STATUS_VALUES.REJECTED) {
    return APPLICATION_CONSTANTS.INTERVIEW_RESULTS.FAILED;
  }

  return APPLICATION_CONSTANTS.INTERVIEW_RESULTS.PENDING;
};

export const resolveInterviewerInterviewResult = (
  interviewStatus: string | undefined,
): InterviewerInterviewResult => {
  const normalizedStatus = (interviewStatus ?? APPLICATION_CONSTANTS.EMPTY_STRING).toUpperCase();

  if (normalizedStatus === interviewStatusCompleted) {
    return APPLICATION_CONSTANTS.INTERVIEW_RESULTS.PASSED;
  }

  if (normalizedStatus === interviewStatusCancelled) {
    return APPLICATION_CONSTANTS.INTERVIEW_RESULTS.FAILED;
  }

  return APPLICATION_CONSTANTS.INTERVIEW_RESULTS.PENDING;
};

export const mapHrInterviews = (interviews: HrInterviewLean[]) => {
  return interviews.map((interview) => {
    const candidate =
      typeof interview.candidateId === 'object' &&
      interview.candidateId !== null &&
      '_id' in interview.candidateId
        ? (interview.candidateId as PopulatedCandidate)
        : null;
    const job =
      typeof interview.jobId === 'object' && interview.jobId !== null && '_id' in interview.jobId
        ? (interview.jobId as PopulatedJob)
        : null;
    const application =
      typeof interview.applicationId === 'object' && interview.applicationId !== null
        ? (interview.applicationId as PopulatedApplication)
        : null;

    return {
      _id: interview._id,
      applicationId: toIdString(application?._id) || toIdString(interview.applicationId),
      applicationStatus: application?.status ?? APPLICATION_CONSTANTS.EMPTY_STRING,
      candidate: {
        _id: toIdString(candidate?._id),
        name: candidate?.name ?? APPLICATION_CONSTANTS.EMPTY_STRING,
        email: candidate?.email ?? APPLICATION_CONSTANTS.EMPTY_STRING,
      },
      job: {
        _id: toIdString(job?._id),
        title: job?.title ?? APPLICATION_CONSTANTS.EMPTY_STRING,
      },
      interviewerName: interview.interviewerName,
      interviewDate: interview.interviewDate,
      interviewTime: interview.interviewTime,
      meetingLink: interview.meetingLink,
      notes: trimOrEmpty(interview.notes),
      status: interview.status,
      feedbackStatus: resolveInterviewFeedbackStatus(
        interview.feedbackStatus,
        interview.status,
        application?.status,
      ),
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
    };
  });
};

export const mapCandidateInterviews = (interviews: CandidateInterviewLean[]) => {
  return interviews.map((interview) => {
    const job =
      typeof interview.jobId === 'object' && interview.jobId !== null && '_id' in interview.jobId
        ? (interview.jobId as PopulatedJob)
        : null;
    const application =
      typeof interview.applicationId === 'object' && interview.applicationId !== null
        ? (interview.applicationId as { status?: string })
        : null;

    return {
      _id: interview._id,
      applicationId: interview.applicationId,
      job: {
        _id: toIdString(job?._id),
        title: job?.title ?? APPLICATION_CONSTANTS.EMPTY_STRING,
      },
      interviewerName: interview.interviewerName,
      interviewDate: interview.interviewDate,
      interviewTime: interview.interviewTime,
      meetingLink: interview.meetingLink,
      notes: trimOrEmpty(interview.notes),
      status: interview.status,
      feedbackStatus: resolveInterviewFeedbackStatus(
        interview.feedbackStatus,
        interview.status,
        application?.status,
      ),
      result: resolveCandidateInterviewResult(application?.status),
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
    };
  });
};

export const mapInterviewerInterviews = (interviews: InterviewerInterviewLean[]) => {
  return interviews.map((interview) => {
    const job =
      typeof interview.jobId === 'object' && interview.jobId !== null && '_id' in interview.jobId
        ? (interview.jobId as PopulatedJob)
        : null;
    const candidate =
      typeof interview.candidateId === 'object' &&
      interview.candidateId !== null &&
      '_id' in interview.candidateId
        ? (interview.candidateId as PopulatedCandidate)
        : null;

    return {
      _id: interview._id,
      applicationId: interview.applicationId,
      job: {
        _id: toIdString(job?._id),
        title: job?.title ?? APPLICATION_CONSTANTS.EMPTY_STRING,
      },
      candidate: {
        _id: toIdString(candidate?._id),
        name: candidate?.name ?? APPLICATION_CONSTANTS.EMPTY_STRING,
        email: candidate?.email ?? APPLICATION_CONSTANTS.EMPTY_STRING,
      },
      interviewerName: interview.interviewerName,
      interviewDate: interview.interviewDate,
      interviewTime: interview.interviewTime,
      meetingLink: interview.meetingLink,
      notes: trimOrEmpty(interview.notes),
      status: interview.status,
      feedbackStatus: resolveInterviewFeedbackStatus(interview.feedbackStatus, interview.status),
      result: resolveInterviewerInterviewResult(interview.status),
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
    };
  });
};
