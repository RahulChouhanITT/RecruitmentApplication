import { beforeEach, describe, expect, it, vi } from 'vitest';

const applicationFindOne = vi.fn();
const applicationCreate = vi.fn();
const jobFindById = vi.fn();
const userFindById = vi.fn();
const emitApplicationCreated = vi.fn();

vi.mock('../../../src/models/applicationModel', () => ({
  ApplicationModel: {
    findOne: applicationFindOne,
    create: applicationCreate,
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

vi.mock('../../../src/events/eventBus', () => ({
  emitApplicationCreated,
}));

const createLeanQuery = (resolvedValue: unknown) => ({
  select: vi.fn().mockReturnValue({
    lean: vi.fn().mockResolvedValue(resolvedValue),
  }),
});

describe('submitJobApplication', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('creates a new application and emits an application created event', async () => {
    const createdApplication = {
      _id: { toString: () => 'application-1' },
      jobId: 'job-1',
      candidateId: '507f1f77bcf86cd799439011',
      status: 'APPLIED',
    };

    jobFindById.mockReturnValue(
      createLeanQuery({
        _id: { toString: () => 'job-1' },
        title: 'Frontend Engineer',
        isActive: true,
      }),
    );
    applicationFindOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });
    applicationCreate.mockResolvedValue(createdApplication);
    userFindById.mockReturnValue(
      createLeanQuery({
        name: 'Ava Candidate',
        email: 'ava@example.com',
      }),
    );

    const { submitJobApplication } = await import(
      '../../../src/services/application/applicationSubmissionService'
    );

    const result = await submitJobApplication('job-1', '507f1f77bcf86cd799439011');

    expect(applicationCreate).toHaveBeenCalledWith({
      jobId: 'job-1',
      candidateId: expect.anything(),
      status: 'APPLIED',
    });
    expect(emitApplicationCreated).toHaveBeenCalledWith({
      applicationId: 'application-1',
      jobId: 'job-1',
      candidateId: '507f1f77bcf86cd799439011',
      candidateName: 'Ava Candidate',
      jobTitle: 'Frontend Engineer',
    });
    expect(result).toEqual({
      data: createdApplication,
      notificationPayload: {
        kind: 'jobApplicationConfirmed',
        candidateEmail: 'ava@example.com',
        candidateName: 'Ava Candidate',
        jobTitle: 'Frontend Engineer',
      },
    });
  });

  it('rejects applications when the job is not available', async () => {
    jobFindById.mockReturnValue(
      createLeanQuery({
        _id: { toString: () => 'job-2' },
        title: 'Backend Engineer',
        isActive: false,
      }),
    );
    applicationFindOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });

    const { submitJobApplication } = await import(
      '../../../src/services/application/applicationSubmissionService'
    );

    await expect(submitJobApplication('job-2', '507f1f77bcf86cd799439012')).rejects.toMatchObject({
      message: 'Job is not available for application',
      statusCode: 400,
    });
    expect(applicationCreate).not.toHaveBeenCalled();
    expect(emitApplicationCreated).not.toHaveBeenCalled();
  });

  it('rejects duplicate applications for the same job and candidate', async () => {
    jobFindById.mockReturnValue(
      createLeanQuery({
        _id: { toString: () => 'job-3' },
        title: 'QA Engineer',
        isActive: true,
      }),
    );
    applicationFindOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: 'existing-application' }),
    });

    const { submitJobApplication } = await import(
      '../../../src/services/application/applicationSubmissionService'
    );

    await expect(submitJobApplication('job-3', '507f1f77bcf86cd799439013')).rejects.toMatchObject({
      message: 'You already applied for this job',
      statusCode: 409,
    });
    expect(applicationCreate).not.toHaveBeenCalled();
  });

  it('returns a confirmation payload even when the candidate profile cannot be resolved', async () => {
    const createdApplication = {
      _id: { toString: () => 'application-4' },
      jobId: 'job-4',
      candidateId: '507f1f77bcf86cd799439014',
      status: 'APPLIED',
    };

    jobFindById.mockReturnValue(
      createLeanQuery({
        _id: { toString: () => 'job-4' },
        title: 'DevOps Engineer',
        isActive: true,
      }),
    );
    applicationFindOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });
    applicationCreate.mockResolvedValue(createdApplication);
    userFindById.mockReturnValue(createLeanQuery(null));

    const { submitJobApplication } = await import(
      '../../../src/services/application/applicationSubmissionService'
    );

    const result = await submitJobApplication('job-4', '507f1f77bcf86cd799439014');

    expect(emitApplicationCreated).not.toHaveBeenCalled();
    expect(result.notificationPayload).toEqual({
      kind: 'jobApplicationConfirmed',
      candidateEmail: undefined,
      candidateName: '',
      jobTitle: 'DevOps Engineer',
    });
  });
});
