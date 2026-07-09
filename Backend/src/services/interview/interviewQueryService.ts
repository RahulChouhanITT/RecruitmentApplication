import { InterviewModel, INTERVIEW_STATUSES } from '../../models/interviewModel';
import { UserModel } from '../../models/userModel';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { ApplicationError } from '../../utils/errors/applicationError';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';
import {
  INTERVIEW_APPLICATION_STATUS_FIELDS,
  INTERVIEW_CANDIDATE_FIELDS,
  INTERVIEWER_ROLE_FIELDS,
  INTERVIEW_JOB_FIELDS,
  INTERVIEW_TIME_FIELDS,
} from '../../utils/constants';
import type {
  CandidateInterviewLean,
  HrInterviewLean,
  InterviewerInterviewLean,
} from '../../utils/types';
import {
  generateDailyInterviewSlots,
  mapCandidateInterviews,
  mapHrInterviews,
  mapInterviewerInterviews,
} from './helpers/interviewServiceHelpers';
import { trimValue } from '../../utils/common/stringHelpers';
import type { InterviewListQuery, PaginationResult } from '../../utils/types';

const [interviewStatusScheduled] = INTERVIEW_STATUSES;

const parsePositiveInteger = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
};

const paginateResults = <T>(
  items: T[],
  query: Pick<InterviewListQuery, 'page' | 'limit'>,
): PaginationResult<T> => {
  const page = parsePositiveInteger(query.page, 1);
  const limit = parsePositiveInteger(query.limit, 10);
  const skip = (page - 1) * limit;
  const data = items.slice(skip, skip + limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: items.length > 0 ? Math.ceil(items.length / limit) : 1,
    },
  };
};

const matchesInterviewView = (status: string, view: string) => {
  if (!view || view === 'all') {
    return true;
  }

  if (view === 'completed') {
    return status === 'COMPLETED';
  }

  if (view === 'upcoming') {
    return status !== 'COMPLETED';
  }

  return true;
};

const matchesHrInterviewStatus = (status: string, interviewStatus: string) => {
  if (!interviewStatus || interviewStatus === 'all') {
    return true;
  }

  return status.toLowerCase() === interviewStatus;
};

const matchesFeedbackStatus = (feedbackStatus: string | undefined, expectedFeedbackStatus: string) => {
  if (!expectedFeedbackStatus || expectedFeedbackStatus === 'all') {
    return true;
  }

  return (feedbackStatus ?? APPLICATION_CONSTANTS.EMPTY_STRING).toLowerCase() === expectedFeedbackStatus;
};

const matchesSearch = (parts: Array<string | undefined>, searchQuery: string) => {
  if (!searchQuery) {
    return true;
  }

  return parts.join(' ').toLowerCase().includes(searchQuery);
};

const fetchInterviewerAvailabilityUser = async (interviewerId: string) => {
  return UserModel.findById(interviewerId).select(INTERVIEWER_ROLE_FIELDS).lean();
};

const findScheduledInterviewTimesByDate = async (interviewerId: string, interviewDate: string) => {
  return InterviewModel.find({
    interviewerId,
    interviewDate,
    status: interviewStatusScheduled,
  })
    .select(INTERVIEW_TIME_FIELDS)
    .lean();
};

const findHrInterviewRecords = async () => {
  return InterviewModel.find()
    .populate('candidateId', INTERVIEW_CANDIDATE_FIELDS)
    .populate('jobId', INTERVIEW_JOB_FIELDS)
    .populate('applicationId', INTERVIEW_APPLICATION_STATUS_FIELDS)
    .sort({ interviewDate: 1, interviewTime: 1 })
    .lean<HrInterviewLean[]>();
};

const findCandidateInterviewRecords = async (candidateUserId: string) => {
  return InterviewModel.find({ candidateId: candidateUserId })
    .populate('jobId', INTERVIEW_JOB_FIELDS)
    .populate('applicationId', INTERVIEW_APPLICATION_STATUS_FIELDS)
    .sort({ interviewDate: -1, interviewTime: -1 })
    .lean<CandidateInterviewLean[]>();
};

const findInterviewerInterviewRecords = async (interviewerUserId: string) => {
  return InterviewModel.find({ interviewerId: interviewerUserId })
    .populate('jobId', INTERVIEW_JOB_FIELDS)
    .populate('candidateId', INTERVIEW_CANDIDATE_FIELDS)
    .sort({ interviewDate: -1, interviewTime: -1 })
    .lean<InterviewerInterviewLean[]>();
};

export const getInterviewerAvailabilityForDate = async (
  interviewerId: string,
  interviewDate: string,
) => {
  if (!trimValue(interviewerId) || !trimValue(interviewDate)) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.INTERVIEW.INTERVIEWER_ID_AND_DATE_REQUIRED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  const interviewer = await fetchInterviewerAvailabilityUser(interviewerId);
  if (!interviewer || interviewer.role !== APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.INTERVIEW.INTERVIEWER_NOT_FOUND,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND,
    );
  }

  const bookedInterviews = await findScheduledInterviewTimesByDate(
    interviewer._id.toString(),
    interviewDate,
  );

  const bookedTimes = new Set(bookedInterviews.map((interview) => interview.interviewTime));

  return generateDailyInterviewSlots().map((time) => ({
    time,
    available: !bookedTimes.has(time),
  }));
};

export const getHrInterviews = async (query: InterviewListQuery) => {
  const interviews = await findHrInterviewRecords();
  const mappedInterviews = mapHrInterviews(interviews);
  const normalizedSearch = trimValue(query.search).toLowerCase();
  const normalizedView = trimValue(query.view).toLowerCase();
  const normalizedStatus = trimValue(query.status).toLowerCase();
  const normalizedFeedbackStatus = trimValue(query.feedbackStatus).toLowerCase();

  const filteredInterviews = mappedInterviews.filter((interview) => {
    if (!matchesInterviewView(interview.status, normalizedView)) {
      return false;
    }

    if (!matchesHrInterviewStatus(interview.status, normalizedStatus)) {
      return false;
    }

    if (!matchesFeedbackStatus(interview.feedbackStatus, normalizedFeedbackStatus)) {
      return false;
    }

    return matchesSearch(
      [
        interview.job.title,
        interview.candidate.name,
        interview.candidate.email,
        interview.interviewerName,
      ],
      normalizedSearch,
    );
  });

  return paginateResults(filteredInterviews, query);
};

export const getCandidateInterviews = async (
  candidateUserId: string,
  query: InterviewListQuery,
) => {
  const interviews = await findCandidateInterviewRecords(candidateUserId);
  const mappedInterviews = mapCandidateInterviews(interviews);
  const normalizedSearch = trimValue(query.search).toLowerCase();
  const normalizedView = trimValue(query.view).toLowerCase();

  const filteredInterviews = mappedInterviews.filter((interview) => {
    if (!matchesInterviewView(interview.status, normalizedView)) {
      return false;
    }

    return matchesSearch(
      [interview.job.title, interview.interviewerName, interview.status],
      normalizedSearch,
    );
  });

  return paginateResults(filteredInterviews, query);
};

export const getInterviewerInterviews = async (
  interviewerUserId: string,
  query: InterviewListQuery,
) => {
  const interviews = await findInterviewerInterviewRecords(interviewerUserId);
  const mappedInterviews = mapInterviewerInterviews(interviews);
  const normalizedSearch = trimValue(query.search).toLowerCase();
  const normalizedView = trimValue(query.view).toLowerCase();

  const filteredInterviews = mappedInterviews.filter((interview) => {
    if (!matchesInterviewView(interview.status, normalizedView)) {
      return false;
    }

    return matchesSearch(
      [interview.job.title, interview.candidate.name, interview.candidate.email, interview.status],
      normalizedSearch,
    );
  });

  return paginateResults(filteredInterviews, query);
};
