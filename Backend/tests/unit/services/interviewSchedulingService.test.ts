import { beforeEach, describe, expect, it, vi } from 'vitest';

const applicationFindById = vi.fn();
const jobFindById = vi.fn();
const userFindById = vi.fn();
const userFindOne = vi.fn();
const interviewFindOneAndUpdate = vi.fn();
const emitInterviewUpdated = vi.fn();

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
    findOne: userFindOne,
  },
}));

vi.mock('../../../src/models/interviewModel', () => ({
  InterviewModel: {
    findOneAndUpdate: interviewFindOneAndUpdate,
  },
  INTERVIEW_STATUSES: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
}));

vi.mock('../../../src/events/eventBus', () => ({
  emitInterviewUpdated,
}));

const createSessionEntityQuery = (resolvedValue: unknown) => ({
  session: vi.fn().mockResolvedValue(resolvedValue),
});

const createSelectSessionEntityQuery = (resolvedValue: unknown) => ({
  select: vi.fn().mockReturnThis(),
  session: vi.fn().mockResolvedValue(resolvedValue),
});

describe('interviewSchedulingService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
  });

  it('builds a scheduling plan with candidate and interviewer ids', async () => {
    const applicationEntity = {
      _id: { toString: () => 'application-1' },
      candidateId: { toString: () => '507f1f77bcf86cd799439011' },
      jobId: 'job-1',
    };
    const candidate = {
      _id: { toString: () => '507f1f77bcf86cd799439011' },
      name: 'Ava Candidate',
      email: 'ava@example.com',
    };
    const interviewer = {
      _id: { toString: () => '507f1f77bcf86cd799439012' },
      name: 'Ishaan Interviewer',
      email: 'ishaan@example.com',
      role: 'interviewer',
    };

    applicationFindById.mockReturnValue(createSessionEntityQuery(applicationEntity));
    jobFindById.mockReturnValue(createSessionEntityQuery({ _id: 'job-1', title: 'Frontend Engineer' }));
    userFindById
      .mockReturnValueOnce(createSelectSessionEntityQuery(candidate))
      .mockReturnValueOnce(createSelectSessionEntityQuery(interviewer));

    const { scheduleApplicationInterview } = await import(
      '../../../src/services/interview/interviewSchedulingService'
    );

    const result = await scheduleApplicationInterview('application-1', {
      interviewerId: '507f1f77bcf86cd799439012',
      interviewerName: '',
      interviewDate: '2026-04-05',
      interviewTime: '10:30',
      notes: 'Bring portfolio',
    });

    expect(result).toEqual({
      data: {
        candidateId: '507f1f77bcf86cd799439011',
        interviewerId: '507f1f77bcf86cd799439012',
      },
      integrationPayload: {
        kind: 'googleMeetEvent',
        summary: 'Interview - Frontend Engineer',
        description: 'Bring portfolio',
        startDateTime: '2026-04-05T05:00:00.000Z',
        endDateTime: '2026-04-05T06:00:00.000Z',
      },
    });
  });

  it('falls back to interviewer name lookup when interviewer id is missing', async () => {
    const applicationEntity = {
      _id: { toString: () => 'application-2' },
      candidateId: { toString: () => '507f1f77bcf86cd799439013' },
      jobId: 'job-2',
    };
    const candidate = {
      _id: { toString: () => '507f1f77bcf86cd799439013' },
      name: 'Riya Candidate',
      email: 'riya@example.com',
    };
    const interviewer = {
      _id: { toString: () => '507f1f77bcf86cd799439014' },
      name: 'Maya Interviewer',
      email: 'maya@example.com',
      role: 'interviewer',
    };

    applicationFindById.mockReturnValue(createSessionEntityQuery(applicationEntity));
    jobFindById.mockReturnValue(createSessionEntityQuery({ _id: 'job-2', title: 'Backend Engineer' }));
    userFindById.mockReturnValueOnce(createSelectSessionEntityQuery(candidate));
    userFindOne.mockReturnValue(createSelectSessionEntityQuery(interviewer));

    const { scheduleApplicationInterview } = await import(
      '../../../src/services/interview/interviewSchedulingService'
    );

    const result = await scheduleApplicationInterview('application-2', {
      interviewerId: '',
      interviewerName: 'Maya Interviewer',
      interviewDate: '2026-04-06',
      interviewTime: '11:00',
      notes: '',
    });

    expect(userFindOne).toHaveBeenCalled();
    expect(result.data).toEqual({
      candidateId: '507f1f77bcf86cd799439013',
      interviewerId: '507f1f77bcf86cd799439014',
    });
  });

  it('requires a valid interviewer when neither id nor name resolves', async () => {
    const applicationEntity = {
      _id: { toString: () => 'application-3' },
      candidateId: { toString: () => '507f1f77bcf86cd799439015' },
      jobId: 'job-3',
    };

    applicationFindById.mockReturnValue(createSessionEntityQuery(applicationEntity));
    jobFindById.mockReturnValue(createSessionEntityQuery({ _id: 'job-3', title: 'QA Engineer' }));
    userFindById
      .mockReturnValueOnce(createSelectSessionEntityQuery({ _id: { toString: () => '507f1f77bcf86cd799439015' }, name: 'Noel', email: 'noel@example.com' }))
      .mockReturnValueOnce(createSelectSessionEntityQuery(null));
    userFindOne.mockReturnValue(createSelectSessionEntityQuery(null));

    const { scheduleApplicationInterview } = await import(
      '../../../src/services/interview/interviewSchedulingService'
    );

    await expect(
      scheduleApplicationInterview('application-3', {
        interviewerId: '',
        interviewerName: '',
        interviewDate: '2026-04-06',
        interviewTime: '11:30',
        notes: '',
      }),
    ).rejects.toMatchObject({
      message: 'Valid interviewer is required',
      statusCode: 400,
    });
  });

  it('finalizes interview scheduling, updates application status, and emits interview update', async () => {
    const applicationEntity = {
      _id: { toString: () => 'application-4' },
      candidateId: { toString: () => '507f1f77bcf86cd799439016' },
      jobId: 'job-4',
      status: 'SHORTLISTED',
      save: vi.fn().mockResolvedValue(undefined),
    };
    const candidate = {
      _id: { toString: () => '507f1f77bcf86cd799439016' },
      name: 'Aarav Candidate',
      email: 'aarav@example.com',
    };
    const interviewer = {
      _id: { toString: () => '507f1f77bcf86cd799439017' },
      name: 'Neha Interviewer',
      email: 'neha@example.com',
      role: 'interviewer',
    };
    const interviewRecord = {
      _id: { toString: () => 'interview-1' },
      interviewDate: '2026-04-07',
      interviewTime: '14:00',
      meetingLink: 'https://meet.example.com/interview-1',
      notes: 'Portfolio review',
    };

    applicationFindById.mockReturnValue(createSessionEntityQuery(applicationEntity));
    jobFindById.mockReturnValue(createSessionEntityQuery({ _id: 'job-4', title: 'Product Designer' }));
    userFindById
      .mockReturnValueOnce(createSelectSessionEntityQuery(candidate))
      .mockReturnValueOnce(createSelectSessionEntityQuery(interviewer));
    interviewFindOneAndUpdate.mockResolvedValue(interviewRecord);

    const { finalizeApplicationInterviewSchedule } = await import(
      '../../../src/services/interview/interviewSchedulingService'
    );

    const result = await finalizeApplicationInterviewSchedule(
      'application-4',
      '507f1f77bcf86cd799439018',
      {
        interviewerId: '507f1f77bcf86cd799439017',
        interviewerName: '',
        interviewDate: '2026-04-07',
        interviewTime: '14:00',
        notes: 'Portfolio review',
      },
      'https://meet.example.com/interview-1',
    );

    expect(applicationEntity.status).toBe('INTERVIEW_SCHEDULED');
    expect(applicationEntity.save).toHaveBeenCalled();
    expect(interviewFindOneAndUpdate).toHaveBeenCalled();
    expect(emitInterviewUpdated).toHaveBeenCalledWith({
      interviewId: 'interview-1',
      applicationId: 'application-4',
      candidateId: '507f1f77bcf86cd799439016',
      interviewerId: '507f1f77bcf86cd799439017',
      candidateName: 'Aarav Candidate',
      interviewerName: 'Neha Interviewer',
      jobTitle: 'Product Designer',
      interviewDate: '2026-04-07',
      interviewTime: '14:00',
    });
    expect(result.notificationPayload?.kind).toBe('interviewInvite');
  });
});
