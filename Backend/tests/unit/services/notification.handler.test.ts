import { beforeEach, describe, expect, it, vi } from 'vitest';

const createNotification = vi.fn();
const getSocketServer = vi.fn();
const findById = vi.fn();

vi.mock('../../../src/services/notification/notification.service', () => ({
  createNotification,
}));

vi.mock('../../../src/socket/socketServer', () => ({
  getSocketServer,
}));

vi.mock('../../../src/models/jobModel', () => ({
  JobModel: {
    findById,
  },
}));

const flushAsyncHandlers = async (): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 0));
};

const createIo = () => {
  const emit = vi.fn();
  const to = vi.fn(() => ({ emit }));

  return {
    emit,
    to,
  };
};

describe('registerNotificationHandler', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('creates and emits an application notification for the job creator', async () => {
    const io = createIo();
    getSocketServer.mockReturnValue(io);
    findById.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ createdBy: 'hr-1' }),
      }),
    });
    createNotification.mockResolvedValue({
      _id: 'notification-1',
      userId: 'hr-1',
      message: 'created',
      type: 'APPLICATION',
      isRead: false,
      metadata: {
        applicationId: 'application-1',
        jobId: 'job-1',
        candidateId: 'candidate-1',
      },
      createdAt: new Date('2026-03-29T10:00:00.000Z'),
    });

    const { registerNotificationHandler } = await import(
      '../../../src/services/notification/notification.handler'
    );
    const { emitApplicationCreated } = await import('../../../src/events/eventBus');

    registerNotificationHandler();
    emitApplicationCreated({
      applicationId: 'application-1',
      jobId: 'job-1',
      candidateId: 'candidate-1',
      candidateName: 'Ava Candidate',
      jobTitle: 'Frontend Developer',
    });
    await flushAsyncHandlers();

    expect(createNotification).toHaveBeenCalledWith({
      userId: 'hr-1',
      message: 'Ava Candidate applied for Frontend Developer.',
      type: 'APPLICATION',
      metadata: {
        applicationId: 'application-1',
        jobId: 'job-1',
        candidateId: 'candidate-1',
      },
    });
    expect(io.to).toHaveBeenCalledWith('user:hr-1');
    expect(io.emit).toHaveBeenCalledWith('notification', expect.objectContaining({ _id: 'notification-1' }));
  });

  it('skips application notifications when the job creator cannot be resolved', async () => {
    findById.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      }),
    });

    const { registerNotificationHandler } = await import(
      '../../../src/services/notification/notification.handler'
    );
    const { emitApplicationCreated } = await import('../../../src/events/eventBus');

    registerNotificationHandler();
    emitApplicationCreated({
      applicationId: 'application-2',
      jobId: 'job-2',
      candidateId: 'candidate-2',
      candidateName: 'No Owner',
      jobTitle: 'Backend Developer',
    });
    await flushAsyncHandlers();

    expect(createNotification).not.toHaveBeenCalled();
    expect(getSocketServer).not.toHaveBeenCalled();
  });

  it('creates a status notification for the candidate', async () => {
    const io = createIo();
    getSocketServer.mockReturnValue(io);
    createNotification.mockResolvedValue({
      _id: 'notification-2',
      userId: 'candidate-4',
      message: 'status changed',
      type: 'STATUS',
      isRead: false,
      metadata: {
        applicationId: 'application-4',
        status: 'SHORTLISTED',
      },
      createdAt: new Date('2026-03-29T11:00:00.000Z'),
    });

    const { registerNotificationHandler } = await import(
      '../../../src/services/notification/notification.handler'
    );
    const { emitApplicationStatusUpdated } = await import('../../../src/events/eventBus');

    registerNotificationHandler();
    emitApplicationStatusUpdated({
      applicationId: 'application-4',
      candidateId: 'candidate-4',
      jobTitle: 'QA Engineer',
      status: 'SHORTLISTED',
    });
    await flushAsyncHandlers();

    expect(createNotification).toHaveBeenCalledWith({
      userId: 'candidate-4',
      message: 'Your application for QA Engineer was updated to SHORTLISTED.',
      type: 'STATUS',
      metadata: {
        applicationId: 'application-4',
        status: 'SHORTLISTED',
      },
    });
    expect(io.to).toHaveBeenCalledWith('user:candidate-4');
  });

  it('creates interview notifications for both candidate and interviewer', async () => {
    const io = createIo();
    getSocketServer.mockReturnValue(io);
    createNotification
      .mockResolvedValueOnce({
        _id: 'notification-3',
        userId: 'candidate-5',
        message: 'candidate notice',
        type: 'INTERVIEW',
        isRead: false,
        metadata: {
          interviewId: 'interview-1',
          applicationId: 'application-5',
        },
        createdAt: new Date('2026-03-29T12:00:00.000Z'),
      })
      .mockResolvedValueOnce({
        _id: 'notification-4',
        userId: 'interviewer-5',
        message: 'interviewer notice',
        type: 'INTERVIEW',
        isRead: false,
        metadata: {
          interviewId: 'interview-1',
          applicationId: 'application-5',
        },
        createdAt: new Date('2026-03-29T12:00:01.000Z'),
      });

    const { registerNotificationHandler } = await import(
      '../../../src/services/notification/notification.handler'
    );
    const { emitInterviewUpdated } = await import('../../../src/events/eventBus');

    registerNotificationHandler();
    emitInterviewUpdated({
      interviewId: 'interview-1',
      applicationId: 'application-5',
      candidateId: 'candidate-5',
      interviewerId: 'interviewer-5',
      candidateName: 'Priya',
      jobTitle: 'Product Designer',
      interviewDate: '2026-04-02',
      interviewTime: '10:30 AM',
    });
    await flushAsyncHandlers();

    expect(createNotification).toHaveBeenCalledTimes(2);
    expect(createNotification).toHaveBeenNthCalledWith(1, {
      userId: 'candidate-5',
      message: 'Interview scheduled for Product Designer on 2026-04-02 at 10:30 AM.',
      type: 'INTERVIEW',
      metadata: {
        interviewId: 'interview-1',
        applicationId: 'application-5',
      },
    });
    expect(createNotification).toHaveBeenNthCalledWith(2, {
      userId: 'interviewer-5',
      message: 'Interview assigned with Priya for Product Designer on 2026-04-02 at 10:30 AM.',
      type: 'INTERVIEW',
      metadata: {
        interviewId: 'interview-1',
        applicationId: 'application-5',
      },
    });
    expect(io.to).toHaveBeenNthCalledWith(1, 'user:candidate-5');
    expect(io.to).toHaveBeenNthCalledWith(2, 'user:interviewer-5');
  });

  it('registers notification listeners only once', async () => {
    const io = createIo();
    getSocketServer.mockReturnValue(io);
    createNotification.mockResolvedValue({
      _id: 'notification-5',
      userId: 'candidate-6',
      message: 'status changed',
      type: 'STATUS',
      isRead: false,
      metadata: {
        applicationId: 'application-6',
        status: 'HIRED',
      },
      createdAt: new Date('2026-03-29T13:00:00.000Z'),
    });

    const { registerNotificationHandler } = await import(
      '../../../src/services/notification/notification.handler'
    );
    const { emitApplicationStatusUpdated } = await import('../../../src/events/eventBus');

    registerNotificationHandler();
    registerNotificationHandler();
    emitApplicationStatusUpdated({
      applicationId: 'application-6',
      candidateId: 'candidate-6',
      jobTitle: 'DevOps Engineer',
      status: 'HIRED',
    });
    await flushAsyncHandlers();

    expect(createNotification).toHaveBeenCalledTimes(1);
    expect(io.to).toHaveBeenCalledTimes(1);
  });
});
