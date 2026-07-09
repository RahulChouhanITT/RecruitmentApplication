import { FeedbackModel } from '../../models/feedbackModel';
import { FEEDBACK_STATUSES, InterviewModel, INTERVIEW_STATUSES } from '../../models/interviewModel';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { ApplicationError } from '../../utils/errors/applicationError';
import { INTERVIEW_CANDIDATE_FIELDS } from '../../utils/constants';
import { assertEntityExists } from '../../utils/common/entityHelpers';
import { toIdString } from '../../utils/common/idHelpers';
import { requireTrimmedValue, trimOrEmpty } from '../../utils/common/stringHelpers';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';
import {
  FEEDBACK_RECOMMENDATIONS,
  type PopulatedCandidate,
  type SubmitFeedbackInput,
} from '../../utils/types';
import { resolveInterviewFeedbackStatus } from './helpers/interviewHelpers';

const findInterviewForFeedbackSubmission = async (interviewId: string) => {
  return InterviewModel.findById(interviewId);
};

const findExistingFeedbackByInterviewId = async (interviewId: string) => {
  return FeedbackModel.findOne({ interviewId });
};

const createInterviewFeedbackRecord = async (payload: SubmitFeedbackInput, interviewId: string) => {
  return FeedbackModel.create({
    interviewId,
    rating: payload.rating,
    comments: trimOrEmpty(payload.comments),
    recommendation: payload.recommendation,
    submittedAt: new Date(),
  });
};

const findInterviewForHrFeedback = async (interviewId: string) => {
  return InterviewModel.findById(interviewId).populate('candidateId', INTERVIEW_CANDIDATE_FIELDS);
};

export const submitInterviewFeedback = async (
  interviewerUserId: string,
  payload: SubmitFeedbackInput,
) => {
  const interviewId = requireTrimmedValue(
    payload.interviewId,
    APPLICATION_MESSAGES.FEEDBACK.INTERVIEW_ID_REQUIRED,
  );

  if (!Number.isInteger(payload.rating) || payload.rating < 1 || payload.rating > 5) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.FEEDBACK.INVALID_RATING,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  if (!payload.recommendation || !FEEDBACK_RECOMMENDATIONS.includes(payload.recommendation)) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.FEEDBACK.INVALID_RECOMMENDATION,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  const interview = await findInterviewForFeedbackSubmission(interviewId);
  assertEntityExists(interview, APPLICATION_MESSAGES.INTERVIEW.NOT_FOUND);

  if (!interview.interviewerId || interview.interviewerId.toString() !== interviewerUserId) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.FEEDBACK.SUBMIT_FORBIDDEN,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.FORBIDDEN,
    );
  }

  if (interview.status !== INTERVIEW_STATUSES[0]) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.FEEDBACK.ONLY_FOR_SCHEDULED_INTERVIEWS,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  const existingFeedback = await findExistingFeedbackByInterviewId(interview._id.toString());
  if (existingFeedback) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.FEEDBACK.ALREADY_SUBMITTED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.CONFLICT,
    );
  }

  const feedback = await createInterviewFeedbackRecord(payload, interview._id.toString());

  interview.status = INTERVIEW_STATUSES[1];
  interview.feedbackStatus = FEEDBACK_STATUSES[1];
  await interview.save();

  return feedback;
};

export const getHrInterviewFeedback = async (_hrUserId: string, interviewId: string) => {
  const normalizedInterviewId = requireTrimmedValue(
    interviewId,
    APPLICATION_MESSAGES.FEEDBACK.INTERVIEW_ID_REQUIRED,
  );

  const interview = await findInterviewForHrFeedback(normalizedInterviewId);
  assertEntityExists(interview, APPLICATION_MESSAGES.INTERVIEW.NOT_FOUND);

  const feedback = await findExistingFeedbackByInterviewId(interview._id.toString());
  if (!feedback) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.FEEDBACK.NOT_SUBMITTED_YET,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND,
    );
  }

  const candidate =
    typeof interview.candidateId === 'object' &&
    interview.candidateId !== null &&
    '_id' in interview.candidateId
      ? (interview.candidateId as PopulatedCandidate)
      : null;

  return {
    _id: feedback._id,
    interviewId: feedback.interviewId,
    rating: feedback.rating,
    comments: trimOrEmpty(feedback.comments),
    recommendation: feedback.recommendation,
    feedbackStatus: resolveInterviewFeedbackStatus(interview.feedbackStatus, interview.status),
    submittedAt: feedback.submittedAt,
    candidate: {
      _id: toIdString(candidate?._id),
      name: candidate?.name ?? APPLICATION_CONSTANTS.EMPTY_STRING,
      email: candidate?.email ?? APPLICATION_CONSTANTS.EMPTY_STRING,
    },
  };
};
