import { JobModel } from '../../models/jobModel';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import {
  onApplicationCreated,
  onApplicationStatusUpdated,
  onInterviewUpdated,
} from '../../events/eventBus';
import type {
  ApplicationCreatedEvent,
  ApplicationStatusUpdatedEvent,
  InterviewUpdatedEvent,
  NotificationDocumentData,
} from '../../utils/types';
import { createNotification } from './notification.service';
import { getSocketServer } from '../../socket/socketServer';
import { buildUserRoom } from '../../socket/utils/socketHelpers';

let areNotificationHandlersRegistered = false;

const sendRealtimeNotification = (
  userId: string,
  notification: NotificationDocumentData,
): void => {
  const io = getSocketServer();
  if (!io) {
    return;
  }

  io.to(buildUserRoom(userId)).emit(APPLICATION_CONSTANTS.SOCKET_EVENTS.NOTIFICATION, notification);
};

const createAndDispatchNotification = async (
  userId: string,
  message: string,
  type: 'APPLICATION' | 'INTERVIEW' | 'STATUS',
  metadata?: Record<string, string | number | boolean | null | undefined>,
): Promise<void> => {
  const notification = await createNotification({
    userId,
    message,
    type,
    metadata,
  });

  sendRealtimeNotification(userId, notification);
};

const handleApplicationCreated = async (event: ApplicationCreatedEvent): Promise<void> => {
  const job = await JobModel.findById(event.jobId).select('createdBy').lean<{ createdBy: string } | null>();
  if (!job?.createdBy) {
    return;
  }

  await createAndDispatchNotification(
    job.createdBy.toString(),
    `${event.candidateName} applied for ${event.jobTitle}.`,
    'APPLICATION',
    {
      applicationId: event.applicationId,
      jobId: event.jobId,
      candidateId: event.candidateId,
    },
  );
};

const handleApplicationStatusUpdated = async (
  event: ApplicationStatusUpdatedEvent,
): Promise<void> => {
  await createAndDispatchNotification(
    event.candidateId,
    `Your application for ${event.jobTitle} was updated to ${event.status}.`,
    'STATUS',
    {
      applicationId: event.applicationId,
      status: event.status,
    },
  );
};

const handleInterviewUpdated = async (event: InterviewUpdatedEvent): Promise<void> => {
  await Promise.all([
    createAndDispatchNotification(
      event.candidateId,
      `Interview scheduled for ${event.jobTitle} on ${event.interviewDate} at ${event.interviewTime}.`,
      'INTERVIEW',
      {
        interviewId: event.interviewId,
        applicationId: event.applicationId,
      },
    ),
    createAndDispatchNotification(
      event.interviewerId,
      `Interview assigned with ${event.candidateName} for ${event.jobTitle} on ${event.interviewDate} at ${event.interviewTime}.`,
      'INTERVIEW',
      {
        interviewId: event.interviewId,
        applicationId: event.applicationId,
      },
    ),
  ]);
};

export const registerNotificationHandler = (): void => {
  if (areNotificationHandlersRegistered) {
    return;
  }

  areNotificationHandlersRegistered = true;

  onApplicationCreated((event) => {
    void handleApplicationCreated(event);
  });

  onApplicationStatusUpdated((event) => {
    void handleApplicationStatusUpdated(event);
  });

  onInterviewUpdated((event) => {
    void handleInterviewUpdated(event);
  });
};
