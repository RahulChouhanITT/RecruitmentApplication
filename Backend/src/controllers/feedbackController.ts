import type { Request, Response } from "express";
import { getHrInterviewFeedback, submitInterviewFeedback } from "../services/feedbackService";
import { APPLICATION_CONSTANTS } from "../utils/constants/applicationConstants";
import { sendSuccessResponse } from "../utils/helpers";
import { APPLICATION_MESSAGES } from "../utils/messages/applicationMessages";
import type { AuthenticatedRequest } from "../utils/types/authTypes";
import type { SubmitFeedbackInput } from "../utils/types/feedbackTypes";

export const submitInterviewFeedbackHandler = async (
  req: AuthenticatedRequest & Request,
  res: Response
): Promise<void> => {
  const requestBody = req.body as SubmitFeedbackInput;
  const feedback = await submitInterviewFeedback(req.authenticatedUserId as string, requestBody);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.CREATED,
    message: APPLICATION_MESSAGES.FEEDBACK.SUBMITTED_SUCCESS,
    data: feedback,
  });
};

export const getHrInterviewFeedbackHandler = async (
  req: AuthenticatedRequest & Request,
  res: Response
): Promise<void> => {
  const { interviewId } = req.params as { interviewId: string };
  const feedback = await getHrInterviewFeedback(req.authenticatedUserId as string, interviewId);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.FEEDBACK.FETCHED_SUCCESS,
    data: feedback,
  });
};
