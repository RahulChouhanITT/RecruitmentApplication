"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const eventBus_1 = require("../../../src/events/eventBus");
(0, vitest_1.describe)('eventBus', () => {
    (0, vitest_1.afterEach)(() => {
        eventBus_1.appEventBus.removeAllListeners(eventBus_1.APP_EVENT_NAMES.APPLICATION_CREATED);
        eventBus_1.appEventBus.removeAllListeners(eventBus_1.APP_EVENT_NAMES.APPLICATION_STATUS_UPDATED);
        eventBus_1.appEventBus.removeAllListeners(eventBus_1.APP_EVENT_NAMES.INTERVIEW_UPDATED);
    });
    (0, vitest_1.it)('notifies listeners when an application is created', () => {
        const listener = vitest_1.vi.fn();
        const event = {
            applicationId: 'app-1',
            jobId: 'job-1',
            candidateId: 'candidate-1',
            candidateName: 'Rahul',
            jobTitle: 'Frontend Developer',
        };
        (0, eventBus_1.onApplicationCreated)(listener);
        (0, eventBus_1.emitApplicationCreated)(event);
        (0, vitest_1.expect)(listener).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(listener).toHaveBeenCalledWith(event);
    });
    (0, vitest_1.it)('notifies listeners when an application status is updated', () => {
        const listener = vitest_1.vi.fn();
        const event = {
            applicationId: 'app-2',
            candidateId: 'candidate-2',
            candidateName: 'Anita',
            jobTitle: 'Backend Developer',
            status: 'SHORTLISTED',
        };
        (0, eventBus_1.onApplicationStatusUpdated)(listener);
        (0, eventBus_1.emitApplicationStatusUpdated)(event);
        (0, vitest_1.expect)(listener).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(listener).toHaveBeenCalledWith(event);
    });
    (0, vitest_1.it)('notifies listeners when an interview is updated', () => {
        const listener = vitest_1.vi.fn();
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
        (0, eventBus_1.onInterviewUpdated)(listener);
        (0, eventBus_1.emitInterviewUpdated)(event);
        (0, vitest_1.expect)(listener).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(listener).toHaveBeenCalledWith(event);
    });
});
