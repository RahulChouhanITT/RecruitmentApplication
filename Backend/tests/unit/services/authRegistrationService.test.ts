import { beforeEach, describe, expect, it, vi } from 'vitest';

const bcryptHash = vi.fn();
const userFindOne = vi.fn();
const userCreate = vi.fn();
const userFindById = vi.fn();
const userFindByIdAndUpdate = vi.fn();
const candidateProfileCreate = vi.fn();
const hrProfileCreate = vi.fn();
const interviewerProfileCreate = vi.fn();

vi.mock('bcryptjs', () => ({
  default: {
    hash: bcryptHash,
  },
}));

vi.mock('../../../src/models/userModel', () => ({
  UserModel: {
    findOne: userFindOne,
    create: userCreate,
    findById: userFindById,
    findByIdAndUpdate: userFindByIdAndUpdate,
  },
}));

vi.mock('../../../src/models/candidateProfileModel', () => ({
  CandidateProfileModel: {
    create: candidateProfileCreate,
  },
}));

vi.mock('../../../src/models/hrProfileModel', () => ({
  HrProfileModel: {
    create: hrProfileCreate,
  },
}));

vi.mock('../../../src/models/interviewerProfileModel', () => ({
  InterviewerProfileModel: {
    create: interviewerProfileCreate,
  },
}));

const createLeanQuery = (resolvedValue: unknown) => ({
  lean: vi.fn().mockResolvedValue(resolvedValue),
});

const createSelectLeanQuery = (resolvedValue: unknown) => ({
  select: vi.fn().mockReturnValue({
    lean: vi.fn().mockResolvedValue(resolvedValue),
  }),
});

describe('registerUser', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    vi.spyOn(Math, 'random').mockReturnValue(0.123456);
    bcryptHash.mockResolvedValue('hashed-otp');
  });

  it('registers a candidate, creates profile scaffolding, and returns otp notification payload', async () => {
    userFindOne.mockReturnValue(createLeanQuery(null));
    userCreate.mockResolvedValue({
      _id: '507f1f77bcf86cd799439101',
      email: 'ava@example.com',
      name: 'Ava Candidate',
    });
    userFindByIdAndUpdate.mockResolvedValue(undefined);
    userFindById.mockReturnValue(
      createSelectLeanQuery({
        _id: '507f1f77bcf86cd799439101',
        name: 'Ava Candidate',
        email: 'ava@example.com',
        role: 'candidate',
        profileCompleted: false,
        isEmailVerified: false,
        isApproved: false,
      }),
    );

    const { registerUser } = await import('../../../src/services/auth/authRegistrationService');

    const result = await registerUser({
      name: ' Ava Candidate ',
      email: 'AVA@example.com',
      password: 'Password123',
      role: 'candidate',
    });

    expect(userCreate).toHaveBeenCalledWith({
      name: 'Ava Candidate',
      email: 'ava@example.com',
      passwordHash: 'Password123',
      role: 'candidate',
    });
    expect(candidateProfileCreate).toHaveBeenCalledWith({
      userId: '507f1f77bcf86cd799439101',
    });
    expect(hrProfileCreate).not.toHaveBeenCalled();
    expect(interviewerProfileCreate).not.toHaveBeenCalled();
    expect(userFindByIdAndUpdate).toHaveBeenCalledWith('507f1f77bcf86cd799439101', {
      $set: {
        otpCodeHash: 'hashed-otp',
        otpExpiryTime: expect.any(Date),
        otpAttemptCount: 0,
      },
    });
    expect(result.data.user).toEqual({
      _id: '507f1f77bcf86cd799439101',
      name: 'Ava Candidate',
      email: 'ava@example.com',
      role: 'candidate',
      profileCompleted: false,
      isEmailVerified: false,
      isApproved: false,
    });
    expect(result.notificationPayload).toEqual({
      kind: 'otpVerification',
      emailAddress: 'ava@example.com',
      otpCode: expect.any(String),
      userName: 'Ava Candidate',
    });
  });

  it('creates the correct role-specific profile for hr users', async () => {
    userFindOne.mockReturnValue(createLeanQuery(null));
    userCreate.mockResolvedValue({
      _id: '507f1f77bcf86cd799439102',
      email: 'hr@example.com',
      name: 'HR User',
    });
    userFindByIdAndUpdate.mockResolvedValue(undefined);
    userFindById.mockReturnValue(
      createSelectLeanQuery({
        _id: '507f1f77bcf86cd799439102',
        name: 'HR User',
        email: 'hr@example.com',
        role: 'hr',
        profileCompleted: false,
        isEmailVerified: false,
        isApproved: false,
      }),
    );

    const { registerUser } = await import('../../../src/services/auth/authRegistrationService');

    await registerUser({
      name: 'HR User',
      email: 'hr@example.com',
      password: 'Password123',
      role: 'hr',
    });

    expect(hrProfileCreate).toHaveBeenCalledWith({
      userId: '507f1f77bcf86cd799439102',
    });
    expect(candidateProfileCreate).not.toHaveBeenCalled();
    expect(interviewerProfileCreate).not.toHaveBeenCalled();
  });

  it('rejects duplicate email registration', async () => {
    userFindOne.mockReturnValue(createLeanQuery({ _id: 'existing-user' }));

    const { registerUser } = await import('../../../src/services/auth/authRegistrationService');

    await expect(
      registerUser({
        name: 'Duplicate User',
        email: 'duplicate@example.com',
        password: 'Password123',
        role: 'candidate',
      }),
    ).rejects.toMatchObject({
      message: 'Email is already registered',
      statusCode: 409,
    });

    expect(userCreate).not.toHaveBeenCalled();
    expect(candidateProfileCreate).not.toHaveBeenCalled();
  });

  it('rejects invalid registration payloads before touching persistence', async () => {
    const { registerUser } = await import('../../../src/services/auth/authRegistrationService');

    await expect(
      registerUser({
        name: '',
        email: '',
        password: 'short',
        role: 'candidate',
      }),
    ).rejects.toMatchObject({
      message: 'Validation failed',
      statusCode: 400,
    });

    expect(userFindOne).not.toHaveBeenCalled();
  });
});
