import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  APP_EVENT_NAMES,
  appEventBus,
  emitApplicationCreated,
  emitApplicationStatusUpdated,
  emitInterviewUpdated,
  onApplicationCreated,
  onApplicationStatusUpdated,
  onInterviewUpdated,
} from '../../../src/events/eventBus';

describe('eventBus', () => {
  afterEach(() => {
    appEventBus.removeAllListeners(APP_EVENT_NAMES.APPLICATION_CREATED);
    appEventBus.removeAllListeners(APP_EVENT_NAMES.APPLICATION_STATUS_UPDATED);
    appEventBus.removeAllListeners(APP_EVENT_NAMES.INTERVIEW_UPDATED);
  });

  it('notifies listeners when an application is created', () => {
    const listener = vi.fn();
    const event = {
      applicationId: 'app-1',
      jobId: 'job-1',
      candidateId: 'candidate-1',
      candidateName: 'Rahul',
      jobTitle: 'Frontend Developer',
    };

    onApplicationCreated(listener);
    emitApplicationCreated(event);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(event);
  });

  it('notifies listeners when an application status is updated', () => {
    const listener = vi.fn();
    const event = {
      applicationId: 'app-2',
      candidateId: 'candidate-2',
      candidateName: 'Anita',
      jobTitle: 'Backend Developer',
      status: 'SHORTLISTED',
    };

    onApplicationStatusUpdated(listener);
    emitApplicationStatusUpdated(event);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(event);
  });

  it('notifies listeners when an interview is updated', () => {
    const listener = vi.fn();
    const event = {
      interviewId: 'interview-1',
      applicationId: 'app-3',
      candidateId: 'candidate-3',
      interviewerId: 'interviewer-1',
      candidateName: 'Vikram',
      interviewerName: 'Priya',
      jobTitle: 'QA Engineer',
      interviewDate: '2026-03-28',
      interviewTime: '10:30',
    };

    onInterviewUpdated(listener);
    emitInterviewUpdated(event);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(event);
  });
});
