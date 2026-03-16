import type { Response } from "express";
import type { Request } from "express";
import {
  cancelInterviewByHr,
  getCandidateInterviews,
  getHrInterviews,
  getInterviewerInterviews,
  getInterviewerAvailabilityForDate,
  scheduleInterviewByHr,
} from "../services/applicationService";
import { APPLICATION_CONSTANTS } from "../utils/constants/applicationConstants";
import { sendSuccessResponse } from "../utils/helpers";
import { APPLICATION_MESSAGES } from "../utils/messages/applicationMessages";
import type { ScheduleInterviewByHrBody } from "../utils/types/applicationTypes";
import type { AuthenticatedRequest } from "../utils/types/authTypes";

export const getHrInterviewsHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const interviews = await getHrInterviews(req.authenticatedUserId as string);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.INTERVIEW.FETCHED_SUCCESS,
    data: interviews,
  });
};

export const scheduleInterviewHandler = async (
  req: AuthenticatedRequest & Request,
  res: Response
): Promise<void> => {
  const requestBody = req.body as ScheduleInterviewByHrBody;
  const interview = await scheduleInterviewByHr(req.authenticatedUserId as string, requestBody);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.CREATED,
    message: APPLICATION_MESSAGES.INTERVIEW.SCHEDULED_SUCCESS,
    data: interview,
  });
};

export const cancelInterviewHandler = async (
  req: AuthenticatedRequest & Request,
  res: Response
): Promise<void> => {
  const { interviewId } = req.params as { interviewId: string };
  const interview = await cancelInterviewByHr(interviewId, req.authenticatedUserId as string);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.INTERVIEW.CANCELLED_SUCCESS,
    data: interview,
  });
};

export const getInterviewerAvailabilityHandler = async (
  req: AuthenticatedRequest & Request,
  res: Response
): Promise<void> => {
  const { interviewerId, date } = req.query as { interviewerId?: string; date?: string };
  const slots = await getInterviewerAvailabilityForDate(interviewerId ?? "", date ?? "");

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.INTERVIEW.AVAILABILITY_FETCHED_SUCCESS,
    data: slots,
  });
};

export const getCandidateInterviewsHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const interviews = await getCandidateInterviews(req.authenticatedUserId as string);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.INTERVIEW.CANDIDATE_FETCHED_SUCCESS,
    data: interviews,
  });
};

export const getInterviewerInterviewsHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const interviews = await getInterviewerInterviews(req.authenticatedUserId as string);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.INTERVIEW.INTERVIEWER_FETCHED_SUCCESS,
    data: interviews,
  });
};
