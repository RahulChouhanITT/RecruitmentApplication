import { Types } from 'mongoose';
import { NotificationModel } from '../../models/notification.model';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { ApplicationError } from '../../utils/errors/applicationError';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';
import type { CreateNotificationPayload, NotificationDocumentData } from '../../utils/types';

type NotificationRecord = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  message: string;
  type: 'APPLICATION' | 'INTERVIEW' | 'STATUS';
  isRead: boolean;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  createdAt: Date;
};

const mapNotificationRecord = (
  notification: NotificationRecord | NotificationDocumentData,
): NotificationDocumentData => ({
  _id: notification._id.toString(),
  userId: notification.userId.toString(),
  message: notification.message,
  type: notification.type,
  isRead: notification.isRead,
  metadata: notification.metadata,
  createdAt: notification.createdAt,
});

export const createNotification = async (
  payload: CreateNotificationPayload,
): Promise<NotificationDocumentData> => {
  const notification = await NotificationModel.create({
    userId: new Types.ObjectId(payload.userId),
    message: payload.message,
    type: payload.type,
    metadata: payload.metadata,
  });

  return mapNotificationRecord(notification as NotificationRecord);
};

export const getUserNotifications = async (
  userId: string,
): Promise<NotificationDocumentData[]> => {
  const notifications = await NotificationModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean<NotificationRecord[]>();

  return notifications.map(mapNotificationRecord);
};

export const markNotificationAsRead = async (
  notificationId: string,
): Promise<NotificationDocumentData> => {
  const notification = await NotificationModel.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true },
  ).lean<NotificationRecord | null>();

  if (!notification) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.NOTIFICATION.NOT_FOUND,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND,
    );
  }

  return mapNotificationRecord(notification);
};

export const markAllAsRead = async (userId: string): Promise<void> => {
  await NotificationModel.updateMany({ userId, isRead: false }, { isRead: true });
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  return NotificationModel.countDocuments({ userId, isRead: false });
};
