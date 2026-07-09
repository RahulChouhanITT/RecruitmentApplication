import type { Request, Response } from 'express';
import {
  getHrInterviews as getHrInterviewsService,
  getInterviewerAvailabilityForDate as getInterviewerAvailabilityForDateService,
  getInterviewerInterviews as getInterviewerInterviewsService,
} from '../services/interview/interviewQueryService';
import {
  scheduleApplicationInterview as scheduleApplicationInterviewService,
  finalizeApplicationInterviewSchedule as finalizeApplicationInterviewScheduleService,
} from '../services/interview/interviewSchedulingService';
import { cancelInterviewByHr as cancelInterviewByHrService } from '../services/interview/interviewManagementService';
import { ensureCandidateInterviewerConversation } from '../services/chat/chatConversationService';
import { dispatchChatRealtime } from '../services/chat/chatRealtimePublisher';
import { sendNotification } from '../services/notification/notificationDispatcher';
import { createGoogleMeetEvent } from '../services/google/googleCalendarService';
import { sendSuccessResponse } from '../utils/http/responseHelpers';
import { getAuthenticatedUserId } from './helpers/requestAuthHelpers';
import { APPLICATION_CONSTANTS } from '../utils/constants/applicationConstants';
import { APPLICATION_MESSAGES } from '../utils/messages/applicationMessages';
import type { InterviewListQuery, ScheduleInterviewByHrBody } from '../utils/types/applicationTypes';
import type { AuthenticatedRequest } from '../utils/types/authTypes';

export const getHrInterviews = async (
  req: AuthenticatedRequest & Request<unknown, unknown, unknown, InterviewListQuery>,
  res: Response,
): Promise<void> => {
  const interviews = await getHrInterviewsService(req.query);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.INTERVIEW.FETCHED_SUCCESS,
    data: interviews.data,
    pagination: interviews.pagination,
  });
};

export const scheduleInterview = async (
  req: AuthenticatedRequest & Request<unknown, unknown, ScheduleInterviewByHrBody>,
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const interviewPayload = req.body;

  const schedulingPlan = await scheduleApplicationInterviewService(
    interviewPayload.applicationId,
    interviewPayload,
  );
  const meetingLink = await createGoogleMeetEvent(schedulingPlan.integrationPayload!);
  const scheduleResult = await finalizeApplicationInterviewScheduleService(
    interviewPayload.applicationId,
    authenticatedUserId,
    interviewPayload,
    meetingLink,
  );
  const conversationResult = await ensureCandidateInterviewerConversation(
    scheduleResult.data.candidateId,
    scheduleResult.data.interviewerId,
  );
  await dispatchChatRealtime(conversationResult.realtimePayload);
  await sendNotification(scheduleResult.notificationPayload);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.CREATED,
    message: APPLICATION_MESSAGES.INTERVIEW.SCHEDULED_SUCCESS,
  });
};

export const cancelInterview = async (
  req: AuthenticatedRequest & Request<{ interviewId: string }>,
  res: Response,
): Promise<void> => {
  const { interviewId } = req.params;
  await cancelInterviewByHrService(interviewId);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.INTERVIEW.CANCELLED_SUCCESS,
  });
};

export const getInterviewerAvailability = async (
  req: AuthenticatedRequest &
    Request<unknown, unknown, unknown, { interviewerId?: string; date?: string }>,
  res: Response,
): Promise<void> => {
  const { interviewerId, date } = req.query;
  const slots = await getInterviewerAvailabilityForDateService(interviewerId ?? '', date ?? '');

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.INTERVIEW.AVAILABILITY_FETCHED_SUCCESS,
    data: slots,
  });
};

export const getInterviewerInterviews = async (
  req: AuthenticatedRequest & Request<unknown, unknown, unknown, InterviewListQuery>,
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const interviews = await getInterviewerInterviewsService(authenticatedUserId, req.query);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.INTERVIEW.INTERVIEWER_FETCHED_SUCCESS,
    data: interviews.data,
    pagination: interviews.pagination,
  });
};
