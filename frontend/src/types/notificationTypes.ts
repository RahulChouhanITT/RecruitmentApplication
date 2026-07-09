export type NotificationType = 'APPLICATION' | 'INTERVIEW' | 'STATUS';

export type NotificationItem = {
  _id: string;
  userId: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  createdAt: string;
};

export type NotificationUnreadCount = {
  count: number;
};

export type NotificationApiResponse<TData = undefined> = {
  success: boolean;
  message: string;
  data?: TData;
};
