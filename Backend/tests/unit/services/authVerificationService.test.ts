import { beforeEach, describe, expect, it, vi } from 'vitest';

const bcryptHash = vi.fn();
const bcryptCompare = vi.fn();
const userFindOne = vi.fn();
const userFindById = vi.fn();
const userFindByIdAndUpdate = vi.fn();

vi.mock('bcryptjs', () => ({
  default: {
    hash: bcryptHash,
    compare: bcryptCompare,
  },
}));

vi.mock('../../../src/models/userModel', () => ({
  UserModel: {
    findOne: userFindOne,
    findById: userFindById,
    findByIdAndUpdate: userFindByIdAndUpdate,
  },
}));

const createSelectQuery = (resolvedValue: unknown) => ({
  select: vi.fn().mockResolvedValue(resolvedValue),
});

const createSelectLeanQuery = (resolvedValue: unknown) => ({
  select: vi.fn().mockReturnValue({
    lean: vi.fn().mockResolvedValue(resolvedValue),
  }),
});

describe('authVerificationService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    vi.spyOn(Math, 'random').mockReturnValue(0.234567);
    bcryptHash.mockResolvedValue('hashed-otp');
  });

  it('verifies otp and auto-approves candidates', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    userFindOne.mockReturnValue(
      createSelectQuery({
        _id: '507f1f77bcf86cd799439301',
        email: 'ava@example.com',
        name: 'Ava Candidate',
        role: 'candidate',
        otpCodeHash: 'stored-hash',
        otpExpiryTime: new Date(Date.now() + 60_000),
        otpAttemptCount: 0,
        isEmailVerified: false,
        isApproved: false,
        save,
      }),
    );
    bcryptCompare.mockResolvedValue(true);
    userFindById.mockReturnValue(
      createSelectLeanQuery({
        _id: '507f1f77bcf86cd799439301',
        name: 'Ava Candidate',
        email: 'ava@example.com',
        role: 'candidate',
        profileCompleted: false,
        isEmailVerified: true,
        isApproved: true,
      }),
    );

    const { verifyEmailOtp } = await import('../../../src/services/auth/authVerificationService');

    const result = await verifyEmailOtp({
      email: 'AVA@example.com',
      otp: '123456',
    });

    expect(save).toHaveBeenCalled();
    expect(result.data).toEqual({
      _id: '507f1f77bcf86cd799439301',
      name: 'Ava Candidate',
      email: 'ava@example.com',
      role: 'candidate',
      profileCompleted: false,
      isEmailVerified: true,
      isApproved: true,
    });
    expect(result.notificationPayload).toBeNull();
  });

  it('verifies otp for hr users and returns approval-pending notification payload', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    userFindOne.mockReturnValue(
      createSelectQuery({
        _id: '507f1f77bcf86cd799439302',
        email: 'hr@example.com',
        name: 'HR User',
        role: 'hr',
        otpCodeHash: 'stored-hash',
        otpExpiryTime: new Date(Date.now() + 60_000),
        otpAttemptCount: 0,
        isEmailVerified: false,
        isApproved: false,
        save,
      }),
    );
    bcryptCompare.mockResolvedValue(true);
    userFindById.mockReturnValue(
      createSelectLeanQuery({
        _id: '507f1f77bcf86cd799439302',
        name: 'HR User',
        email: 'hr@example.com',
        role: 'hr',
        profileCompleted: false,
        isEmailVerified: true,
        isApproved: false,
      }),
    );

    const { verifyEmailOtp } = await import('../../../src/services/auth/authVerificationService');

    const result = await verifyEmailOtp({
      email: 'hr@example.com',
      otp: '123456',
    });

    expect(result.notificationPayload).toEqual({
      kind: 'approvalPending',
      emailAddress: 'hr@example.com',
      userName: 'HR User',
    });
  });

  it('increments otp attempts and rejects invalid otp values', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const user = {
      _id: '507f1f77bcf86cd799439303',
      email: 'user@example.com',
      name: 'User',
      role: 'candidate',
      otpCodeHash: 'stored-hash',
      otpExpiryTime: new Date(Date.now() + 60_000),
      otpAttemptCount: 1,
      isEmailVerified: false,
      isApproved: false,
      save,
    };
    userFindOne.mockReturnValue(createSelectQuery(user));
    bcryptCompare.mockResolvedValue(false);

    const { verifyEmailOtp } = await import('../../../src/services/auth/authVerificationService');

    await expect(
      verifyEmailOtp({
        email: 'user@example.com',
        otp: '000000',
      }),
    ).rejects.toMatchObject({
      message: 'Invalid OTP',
      statusCode: 400,
    });

    expect(user.otpAttemptCount).toBe(2);
    expect(save).toHaveBeenCalled();
  });

  it('rejects expired otp values', async () => {
    userFindOne.mockReturnValue(
      createSelectQuery({
        _id: '507f1f77bcf86cd799439304',
        email: 'user@example.com',
        name: 'User',
        role: 'candidate',
        otpCodeHash: 'stored-hash',
        otpExpiryTime: new Date(Date.now() - 60_000),
        otpAttemptCount: 0,
        save: vi.fn(),
      }),
    );

    const { verifyEmailOtp } = await import('../../../src/services/auth/authVerificationService');

    await expect(
      verifyEmailOtp({
        email: 'user@example.com',
        otp: '123456',
      }),
    ).rejects.toMatchObject({
      message: 'OTP has expired. Please request a new OTP',
      statusCode: 400,
    });
  });

  it('resends otp for unverified users', async () => {
    userFindOne.mockReturnValue(
      createSelectQuery({
        _id: '507f1f77bcf86cd799439305',
        email: 'user@example.com',
        name: 'User Name',
        isEmailVerified: false,
      }),
    );
    userFindByIdAndUpdate.mockResolvedValue(undefined);

    const { resendEmailOtp } = await import('../../../src/services/auth/authVerificationService');

    const result = await resendEmailOtp({
      email: 'USER@example.com',
    });

    expect(userFindByIdAndUpdate).toHaveBeenCalledWith('507f1f77bcf86cd799439305', {
      $set: {
        otpCodeHash: 'hashed-otp',
        otpExpiryTime: expect.any(Date),
        otpAttemptCount: 0,
      },
    });
    expect(result.data).toEqual({
      otpCode: expect.any(String),
    });
    expect(result.notificationPayload).toEqual({
      kind: 'otpVerification',
      emailAddress: 'user@example.com',
      otpCode: expect.any(String),
      userName: 'User Name',
    });
  });

  it('rejects otp resend for already verified users', async () => {
    userFindOne.mockReturnValue(
      createSelectQuery({
        _id: '507f1f77bcf86cd799439306',
        email: 'verified@example.com',
        name: 'Verified User',
        isEmailVerified: true,
      }),
    );

    const { resendEmailOtp } = await import('../../../src/services/auth/authVerificationService');

    await expect(
      resendEmailOtp({
        email: 'verified@example.com',
      }),
    ).rejects.toMatchObject({
      message: 'Email verified successfully',
      statusCode: 400,
    });
  });
});
