import { EventEmitter } from 'events';
import type {
  ApplicationCreatedEvent,
  ApplicationStatusUpdatedEvent,
  InterviewUpdatedEvent,
} from '../utils/types/notificationTypes';

const appEventBus = new EventEmitter();

export const APP_EVENT_NAMES = {
  APPLICATION_CREATED: 'application.created',
  APPLICATION_STATUS_UPDATED: 'application.status.updated',
  INTERVIEW_UPDATED: 'interview.updated',
} as const;

export const emitApplicationCreated = (event: ApplicationCreatedEvent): void => {
  appEventBus.emit(APP_EVENT_NAMES.APPLICATION_CREATED, event);
};

export const onApplicationCreated = (listener: (event: ApplicationCreatedEvent) => void): void => {
  appEventBus.on(APP_EVENT_NAMES.APPLICATION_CREATED, listener);
};

export const emitApplicationStatusUpdated = (event: ApplicationStatusUpdatedEvent): void => {
  appEventBus.emit(APP_EVENT_NAMES.APPLICATION_STATUS_UPDATED, event);
};

export const onApplicationStatusUpdated = (
  listener: (event: ApplicationStatusUpdatedEvent) => void,
): void => {
  appEventBus.on(APP_EVENT_NAMES.APPLICATION_STATUS_UPDATED, listener);
};

export const emitInterviewUpdated = (event: InterviewUpdatedEvent): void => {
  appEventBus.emit(APP_EVENT_NAMES.INTERVIEW_UPDATED, event);
};

export const onInterviewUpdated = (listener: (event: InterviewUpdatedEvent) => void): void => {
  appEventBus.on(APP_EVENT_NAMES.INTERVIEW_UPDATED, listener);
};

export { appEventBus };
