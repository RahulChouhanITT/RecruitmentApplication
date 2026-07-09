export const NOTIFICATION_TYPES = ['APPLICATION', 'INTERVIEW', 'STATUS'] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type NotificationMetadata = Record<string, string | number | boolean | null | undefined>;

export type NotificationDocumentData = {
  _id: string;
  userId: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  metadata?: NotificationMetadata;
  createdAt: Date;
};

export type CreateNotificationPayload = {
  userId: string;
  message: string;
  type: NotificationType;
  metadata?: NotificationMetadata;
};

export type ApplicationCreatedEvent = {
  applicationId: string;
  jobId: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
};

export type ApplicationStatusUpdatedEvent = {
  applicationId: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  status: string;
};

export type InterviewUpdatedEvent = {
  interviewId: string;
  applicationId: string;
  candidateId: string;
  interviewerId: string;
  candidateName: string;
  interviewerName: string;
  jobTitle: string;
  interviewDate: string;
  interviewTime: string;
};
