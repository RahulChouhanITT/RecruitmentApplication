import type { ApplicationStatus } from './applicationTypes';

export type NotificationPayload =
  | {
      kind: 'otpVerification';
      emailAddress: string;
      otpCode: string;
      userName: string;
    }
  | {
      kind: 'approvalPending';
      emailAddress: string;
      userName: string;
    }
  | {
      kind: 'approvalSuccess';
      emailAddress: string;
      userName: string;
    }
  | {
      kind: 'applicationStatusUpdated';
      candidateEmail?: string;
      candidateName: string;
      jobTitle: string;
      applicationStatus: ApplicationStatus;
    }
  | {
      kind: 'jobApplicationConfirmed';
      candidateEmail?: string;
      candidateName: string;
      jobTitle: string;
    }
  | {
      kind: 'interviewInvite';
      candidateEmail?: string;
      candidateName: string;
      interviewerEmail?: string;
      interviewerName: string;
      jobTitle: string;
      interviewDate: string;
      interviewTime: string;
      meetingLink: string;
      startDateTimeIso: string;
      endDateTimeIso: string;
      notes: string;
    };

export type GoogleMeetIntegrationPayload = {
  kind: 'googleMeetEvent';
  summary: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
};

export type ResumeUrlRepairIntegrationPayload = {
  kind: 'resolveResumeUrl';
  resumePublicId: string;
  currentResumeUrl: string;
};

export type ChatRealtimePayload =
  | {
      kind: 'messageCreated';
      participantIds: string[];
      message: unknown;
    }
  | {
      kind: 'conversationUpdated';
      updates: Array<{
        userId: string;
        conversationId: string;
        lastMessage: string;
        lastMessageAt: Date | null;
        unreadCount: number;
      }>;
    }
  | {
      kind: 'conversationCreated';
      participantIds: string[];
      conversationId: string;
    }
  | {
      kind: 'conversationSeen';
      userId: string;
      conversationId: string;
    };

export type ResumeStorageIntegrationPayload =
  | {
      kind: 'uploadResume';
      existingResumePublicId?: string;
      file: import('./candidateTypes').UploadedResumeFile;
    }
  | {
      kind: 'deleteResume';
      existingResumePublicId?: string;
    };

export type IntegrationPayload =
  | GoogleMeetIntegrationPayload
  | ResumeStorageIntegrationPayload
  | ResumeUrlRepairIntegrationPayload;

export type ServiceResult<
  TData,
  TNotificationPayload = NotificationPayload | NotificationPayload[] | null,
  TIntegrationPayload = IntegrationPayload | IntegrationPayload[] | null,
  TRealtimePayload = ChatRealtimePayload | ChatRealtimePayload[] | null,
> = {
  data: TData;
  notificationPayload?: TNotificationPayload;
  integrationPayload?: TIntegrationPayload;
  realtimePayload?: TRealtimePayload;
};
