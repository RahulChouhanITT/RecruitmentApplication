import { Types } from "mongoose";
import { ApplicationError, APPLICATION_CONSTANTS, APPLICATION_MESSAGES } from "../utils";
import {
  assertEntityExists,
  requireTrimmedValue,
  resolveInterviewFeedbackStatus,
  toIdString,
  trimOrEmpty,
} from "../utils/helpers";
import { FeedbackModel } from "../models/feedbackModel";
import { InterviewModel, INTERVIEW_STATUSES, FEEDBACK_STATUSES } from "../models/interviewModel";
import { FEEDBACK_RECOMMENDATIONS, type SubmitFeedbackInput, type PopulatedCandidate } from "../utils/types";

export const submitInterviewFeedback = async (
  interviewerUserId: string,
  payload: SubmitFeedbackInput
) => {
  const interviewId = requireTrimmedValue(
    payload.interviewId,
    APPLICATION_MESSAGES.FEEDBACK.INTERVIEW_ID_REQUIRED
  );

  if (!Number.isInteger(payload.rating) || payload.rating < 1 || payload.rating > 5) {
    throw new ApplicationError(APPLICATION_MESSAGES.FEEDBACK.INVALID_RATING, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }

  if (!payload.recommendation || !FEEDBACK_RECOMMENDATIONS.includes(payload.recommendation)) {
    throw new ApplicationError(APPLICATION_MESSAGES.FEEDBACK.INVALID_RECOMMENDATION, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }

  const interview = await InterviewModel.findById(interviewId);
  assertEntityExists(interview, APPLICATION_MESSAGES.INTERVIEW.NOT_FOUND);

  if (!interview.interviewerId || interview.interviewerId.toString() !== interviewerUserId) {
    throw new ApplicationError(APPLICATION_MESSAGES.FEEDBACK.SUBMIT_FORBIDDEN, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.FORBIDDEN);
  }

  if (interview.status !== INTERVIEW_STATUSES[0]) {
    throw new ApplicationError(APPLICATION_MESSAGES.FEEDBACK.ONLY_FOR_SCHEDULED_INTERVIEWS, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST);
  }

  const existingFeedback = await FeedbackModel.findOne({ interviewId: interview._id });
  if (existingFeedback) {
    throw new ApplicationError(APPLICATION_MESSAGES.FEEDBACK.ALREADY_SUBMITTED, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.CONFLICT);
  }

  const feedback = await FeedbackModel.create({
    interviewId: interview._id,
    rating: payload.rating,
    comments: trimOrEmpty(payload.comments),
    recommendation: payload.recommendation,
    submittedAt: new Date(),
  });

  interview.status = INTERVIEW_STATUSES[1];
  interview.feedbackStatus = FEEDBACK_STATUSES[1];
  await interview.save();

  return feedback;
};

export const getHrInterviewFeedback = async (_hrUserId: string, interviewId: string) => {
  const normalizedInterviewId = requireTrimmedValue(
    interviewId,
    APPLICATION_MESSAGES.FEEDBACK.INTERVIEW_ID_REQUIRED
  );

  const interview = await InterviewModel.findById(normalizedInterviewId).populate("candidateId", "name email");
  assertEntityExists(interview, APPLICATION_MESSAGES.INTERVIEW.NOT_FOUND);

  const feedback = await FeedbackModel.findOne({ interviewId: interview._id });
  if (!feedback) {
    throw new ApplicationError(APPLICATION_MESSAGES.FEEDBACK.NOT_SUBMITTED_YET, APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND);
  }

  const candidate =
    typeof interview.candidateId === "object" && interview.candidateId !== null && "_id" in interview.candidateId
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
