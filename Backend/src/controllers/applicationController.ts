import type { Request, Response } from "express";
import { scheduleApplicationInterview, updateApplicationStatus } from "../services/applicationService";
import { APPLICATION_CONSTANTS } from "../utils/constants/applicationConstants";
import { sendSuccessResponse } from "../utils/helpers";
import { APPLICATION_MESSAGES } from "../utils/messages/applicationMessages";
import type { ScheduleInterviewInput, UpdateApplicationStatusBody } from "../utils/types/applicationTypes";
import type { AuthenticatedRequest } from "../utils/types/authTypes";

export const updateApplicationStatusHandler = async (
  req: AuthenticatedRequest & Request,
  res: Response
): Promise<void> => {
  const { applicationId } = req.params as { applicationId: string };
  const { status } = req.body as UpdateApplicationStatusBody;
  const updatedApplication = await updateApplicationStatus(
    applicationId,
    req.authenticatedUserId as string,
    status
  );

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.APPLICATION.STATUS_UPDATED_SUCCESS,
    data: updatedApplication,
  });
};

export const scheduleInterviewHandler = async (
  req: AuthenticatedRequest & Request,
  res: Response
): Promise<void> => {
  const { applicationId } = req.params as { applicationId: string };
  const requestBody = req.body as ScheduleInterviewInput;
  const interview = await scheduleApplicationInterview(applicationId, req.authenticatedUserId as string, requestBody);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.CREATED,
    message: APPLICATION_MESSAGES.INTERVIEW.SCHEDULED_SUCCESS,
    data: interview,
  });
};
