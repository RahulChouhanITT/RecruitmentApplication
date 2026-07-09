import type { Request, Response } from 'express';
import {
  getUnreadCount,
  getUserNotifications,
  markAllAsRead,
  markNotificationAsRead,
} from '../services/notification/notification.service';
import { sendSuccessResponse } from '../utils/http/responseHelpers';
import { getAuthenticatedUserId } from './helpers/requestAuthHelpers';
import { APPLICATION_CONSTANTS } from '../utils/constants/applicationConstants';
import { APPLICATION_MESSAGES } from '../utils/messages/applicationMessages';
import type { AuthenticatedRequest } from '../utils/types/authTypes';

export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const notifications = await getUserNotifications(authenticatedUserId);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.NOTIFICATION.FETCHED_SUCCESS,
    data: notifications,
  });
};

export const readNotification = async (
  req: AuthenticatedRequest & Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  const notification = await markNotificationAsRead(req.params.id);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.NOTIFICATION.READ_SUCCESS,
    data: notification,
  });
};

export const readAllNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  await markAllAsRead(authenticatedUserId);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.NOTIFICATION.ALL_READ_SUCCESS,
  });
};

export const getNotificationUnreadCount = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const authenticatedUserId = getAuthenticatedUserId(req);
  const unreadCount = await getUnreadCount(authenticatedUserId);

  sendSuccessResponse(res, {
    statusCode: APPLICATION_CONSTANTS.HTTP_STATUS_CODES.OK,
    message: APPLICATION_MESSAGES.NOTIFICATION.UNREAD_COUNT_FETCHED,
    data: { count: unreadCount },
  });
};
