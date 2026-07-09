import { beforeEach, describe, expect, it, vi } from 'vitest';

const applicationFindById = vi.fn();
const jobFindById = vi.fn();
const userFindById = vi.fn();
const interviewFindOne = vi.fn();
const feedbackFindOne = vi.fn();
const emitApplicationStatusUpdated = vi.fn();

vi.mock('../../../src/models/applicationModel', () => ({
  ApplicationModel: {
    findById: applicationFindById,
  },
}));

vi.mock('../../../src/models/jobModel', () => ({
  JobModel: {
    findById: jobFindById,
  },
}));

vi.mock('../../../src/models/userModel', () => ({
  UserModel: {
    findById: userFindById,
  },
}));

vi.mock('../../../src/models/interviewModel', () => ({
  InterviewModel: {
    findOne: interviewFindOne,
  },
  INTERVIEW_STATUSES: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
}));

vi.mock('../../../src/models/feedbackModel', () => ({
  FeedbackModel: {
    findOne: feedbackFindOne,
  },
}));

vi.mock('../../../src/events/eventBus', () => ({
  emitApplicationStatusUpdated,
}));

const createSessionLeanQuery = (resolvedValue: unknown) => {
  const chain = {
    session: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(resolvedValue),
  };

  return chain;
};

const createSelectSessionLeanQuery = (resolvedValue: unknown) => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    session: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(resolvedValue),
  };

  return chain;
};

const createSessionEntityQuery = (resolvedValue: unknown) => {
  const chain = {
    session: vi.fn().mockReturnThis(),
    then: (onFulfilled: (value: unknown) => unknown) => Promise.resolve(onFulfilled(resolvedValue)),
    catch: (onRejected: (reason: unknown) => unknown) => Promise.resolve().catch(onRejected),
  };

  return chain;
};

describe('updateApplicationStatus', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('updates application status, emits an event, and returns email notification payload', async () => {
    const applicationEntity = {
      _id: { toString: () => 'application-1' },
      candidateId: { toString: () => 'candidate-1' },
      jobId: 'job-1',
      status: 'APPLIED',
      save: vi.fn().mockResolvedValue(undefined),
    };

    applicationFindById.mockReturnValue({
      session: vi.fn().mockResolvedValue(applicationEntity),
    });
    jobFindById.mockReturnValue(createSessionLeanQuery({ _id: 'job-1', title: 'Frontend Engineer' }));
    interviewFindOne.mockReturnValue(createSessionLeanQuery(null));
    userFindById.mockReturnValue(
      createSelectSessionLeanQuery({
        name: 'Ava Candidate',
        email: 'ava@example.com',
      }),
    );

    const { updateApplicationStatus } = await import(
      '../../../src/services/application/applicationStatusService'
    );

    const result = await updateApplicationStatus('application-1', 'shortlisted');

    expect(applicationEntity.status).toBe('SHORTLISTED');
    expect(applicationEntity.save).toHaveBeenCalled();
    expect(emitApplicationStatusUpdated).toHaveBeenCalledWith({
      applicationId: 'application-1',
      candidateId: 'candidate-1',
      candidateName: 'Ava Candidate',
      jobTitle: 'Frontend Engineer',
      status: 'SHORTLISTED',
    });
    expect(result.notificationPayload).toEqual({
      kind: 'applicationStatusUpdated',
      candidateEmail: 'ava@example.com',
      candidateName: 'Ava Candidate',
      jobTitle: 'Frontend Engineer',
      applicationStatus: 'SHORTLISTED',
    });
  });

  it('rejects invalid status values before changing any application data', async () => {
    const { updateApplicationStatus } = await import(
      '../../../src/services/application/applicationStatusService'
    );

    await expect(updateApplicationStatus('application-2', 'not-a-real-status')).rejects.toMatchObject(
      {
        message: 'Invalid application status',
        statusCode: 400,
      },
    );
    expect(applicationFindById).not.toHaveBeenCalled();
  });

  it('blocks status changes when a scheduled interview is still active', async () => {
    const applicationEntity = {
      _id: { toString: () => 'application-3' },
      candidateId: { toString: () => 'candidate-3' },
      jobId: 'job-3',
      status: 'INTERVIEW_SCHEDULED',
      save: vi.fn().mockResolvedValue(undefined),
    };

    applicationFindById.mockReturnValue({
      session: vi.fn().mockResolvedValue(applicationEntity),
    });
    jobFindById.mockReturnValue(createSessionLeanQuery({ _id: 'job-3', title: 'QA Engineer' }));
    interviewFindOne.mockReturnValue(createSessionLeanQuery({ _id: 'interview-1', status: 'SCHEDULED' }));

    const { updateApplicationStatus } = await import(
      '../../../src/services/application/applicationStatusService'
    );

    await expect(updateApplicationStatus('application-3', 'REJECTED')).rejects.toMatchObject({
      message: 'Cancel the scheduled interview before changing application status',
      statusCode: 400,
    });
    expect(applicationEntity.save).not.toHaveBeenCalled();
    expect(emitApplicationStatusUpdated).not.toHaveBeenCalled();
  });

  it('requires feedback before allowing a final decision', async () => {
    const applicationEntity = {
      _id: { toString: () => 'application-4' },
      candidateId: { toString: () => 'candidate-4' },
      jobId: 'job-4',
      status: 'INTERVIEW_SCHEDULED',
      save: vi.fn().mockResolvedValue(undefined),
    };

    applicationFindById.mockReturnValue({
      session: vi.fn().mockResolvedValue(applicationEntity),
    });
    jobFindById.mockReturnValue(createSessionLeanQuery({ _id: 'job-4', title: 'DevOps Engineer' }));
    interviewFindOne
      .mockReturnValueOnce(createSessionLeanQuery(null))
      .mockReturnValueOnce(createSessionEntityQuery({ _id: 'interview-4', feedbackStatus: 'NEEDS_REVIEW', save: vi.fn() }));
    userFindById.mockReturnValue(
      createSelectSessionLeanQuery({
        name: 'Priya Candidate',
        email: 'priya@example.com',
      }),
    );
    feedbackFindOne.mockReturnValue(createSessionLeanQuery(null));

    const { updateApplicationStatus } = await import(
      '../../../src/services/application/applicationStatusService'
    );

    await expect(updateApplicationStatus('application-4', 'HIRED')).rejects.toMatchObject({
      message: 'Feedback must be submitted before final decision',
      statusCode: 400,
    });
    expect(applicationEntity.save).not.toHaveBeenCalled();
    expect(emitApplicationStatusUpdated).not.toHaveBeenCalled();
  });

  it('marks interview feedback reviewed when a final decision is recorded', async () => {
    const interviewEntity = {
      _id: 'interview-5',
      feedbackStatus: 'NEEDS_REVIEW',
      save: vi.fn().mockResolvedValue(undefined),
    };
    const applicationEntity = {
      _id: { toString: () => 'application-5' },
      candidateId: { toString: () => 'candidate-5' },
      jobId: 'job-5',
      status: 'INTERVIEW_SCHEDULED',
      save: vi.fn().mockResolvedValue(undefined),
    };

    applicationFindById.mockReturnValue({
      session: vi.fn().mockResolvedValue(applicationEntity),
    });
    jobFindById.mockReturnValue(
      createSessionLeanQuery({ _id: 'job-5', title: 'Product Designer' }),
    );
    interviewFindOne
      .mockReturnValueOnce(createSessionLeanQuery(null))
      .mockReturnValueOnce(createSessionEntityQuery(interviewEntity));
    userFindById.mockReturnValue(
      createSelectSessionLeanQuery({
        name: 'Riya Candidate',
        email: 'riya@example.com',
      }),
    );
    feedbackFindOne.mockReturnValue(createSessionLeanQuery({ _id: 'feedback-5' }));

    const { updateApplicationStatus } = await import(
      '../../../src/services/application/applicationStatusService'
    );

    const result = await updateApplicationStatus('application-5', 'HIRED');

    expect(interviewEntity.feedbackStatus).toBe('REVIEWED');
    expect(interviewEntity.save).toHaveBeenCalled();
    expect(applicationEntity.status).toBe('HIRED');
    expect(applicationEntity.save).toHaveBeenCalled();
    expect(emitApplicationStatusUpdated).toHaveBeenCalledWith({
      applicationId: 'application-5',
      candidateId: 'candidate-5',
      candidateName: 'Riya Candidate',
      jobTitle: 'Product Designer',
      status: 'HIRED',
    });
    expect(result.notificationPayload).toEqual({
      kind: 'applicationStatusUpdated',
      candidateEmail: 'riya@example.com',
      candidateName: 'Riya Candidate',
      jobTitle: 'Product Designer',
      applicationStatus: 'HIRED',
    });
  });
});
