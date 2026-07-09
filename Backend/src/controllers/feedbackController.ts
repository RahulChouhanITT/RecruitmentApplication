import type { Request, Response } from 'express';
import {
  getHrInterviewFeedback as getHrInterviewFeedbackService,
  submitInterviewFeedback as submitInterviewFeedbackService,
} from '../services/interview/interviewFeedbackService';
import { sendSuccessResponse } from '../utils/http/responseHelpers';
import { getAuthenticatedUserId } from './helpers/requestAuthHelpers';
import { APPLICATION_CONSTANTS } from '../utils/constants/applicationConstants';
import { APPLICATION_MESSAGES } from '../utils/messages/applicationMessages';
import type { AuthenticatedRequest } from '../utils/types/authTypes';
import type { SubmitFeedbackInput } from '../utils/types/feedbackTypes';

export const submitInterviewFeedback = async (
  req: AuthenticatedRequest & Request<unknown, unknown, SubmitFeedbackInput>,
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const feedbackPayload = req.body;
  await submitInterviewFeedbackService(authenticatedUserId, feedbackPayload);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.CREATED,
    message: APPLICATION_MESSAGES.FEEDBACK.SUBMITTED_SUCCESS,
  });
};

export const getHrInterviewFeedback = async (
  req: AuthenticatedRequest & Request<{ interviewId: string }>,
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const { interviewId } = req.params;
  const feedback = await getHrInterviewFeedbackService(authenticatedUserId, interviewId);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.FEEDBACK.FETCHED_SUCCESS,
    data: feedback,
  });
};
