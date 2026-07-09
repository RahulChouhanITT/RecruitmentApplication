import { beforeEach, describe, expect, it, vi } from 'vitest';

const userFindOne = vi.fn();
const userFindById = vi.fn();

vi.mock('../../../src/models/userModel', () => ({
  UserModel: {
    findOne: userFindOne,
    findById: userFindById,
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

describe('loginUser', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
  });

  it('logs in an approved and verified user', async () => {
    userFindOne.mockReturnValue(
      createSelectQuery({
        _id: '507f1f77bcf86cd799439201',
        isEmailVerified: true,
        isApproved: true,
        comparePassword: vi.fn().mockResolvedValue(true),
      }),
    );
    userFindById.mockReturnValue(
      createSelectLeanQuery({
        _id: '507f1f77bcf86cd799439201',
        name: 'Ava Candidate',
        email: 'ava@example.com',
        role: 'candidate',
        profileCompleted: false,
        isEmailVerified: true,
        isApproved: true,
      }),
    );

    const { loginUser } = await import('../../../src/services/auth/authLoginService');

    const result = await loginUser({
      email: 'AVA@example.com',
      password: 'Password123',
    });

    expect(result.data).toEqual({
      _id: '507f1f77bcf86cd799439201',
      name: 'Ava Candidate',
      email: 'ava@example.com',
      role: 'candidate',
      profileCompleted: false,
      isEmailVerified: true,
      isApproved: true,
    });
  });

  it('rejects invalid credentials when the user is missing', async () => {
    userFindOne.mockReturnValue(createSelectQuery(null));

    const { loginUser } = await import('../../../src/services/auth/authLoginService');

    await expect(
      loginUser({
        email: 'missing@example.com',
        password: 'Password123',
      }),
    ).rejects.toMatchObject({
      message: 'Invalid email or password',
      statusCode: 401,
    });
  });

  it('rejects invalid credentials when the password does not match', async () => {
    userFindOne.mockReturnValue(
      createSelectQuery({
        _id: '507f1f77bcf86cd799439202',
        isEmailVerified: true,
        isApproved: true,
        comparePassword: vi.fn().mockResolvedValue(false),
      }),
    );

    const { loginUser } = await import('../../../src/services/auth/authLoginService');

    await expect(
      loginUser({
        email: 'user@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toMatchObject({
      message: 'Invalid email or password',
      statusCode: 401,
    });
  });

  it('rejects users whose email is not verified', async () => {
    userFindOne.mockReturnValue(
      createSelectQuery({
        _id: '507f1f77bcf86cd799439203',
        isEmailVerified: false,
        isApproved: true,
        comparePassword: vi.fn().mockResolvedValue(true),
      }),
    );

    const { loginUser } = await import('../../../src/services/auth/authLoginService');

    await expect(
      loginUser({
        email: 'user@example.com',
        password: 'Password123',
      }),
    ).rejects.toMatchObject({
      message: 'Please verify your email before login',
      statusCode: 403,
    });
  });

  it('rejects users who are not approved', async () => {
    userFindOne.mockReturnValue(
      createSelectQuery({
        _id: '507f1f77bcf86cd799439204',
        isEmailVerified: true,
        isApproved: false,
        comparePassword: vi.fn().mockResolvedValue(true),
      }),
    );

    const { loginUser } = await import('../../../src/services/auth/authLoginService');

    await expect(
      loginUser({
        email: 'user@example.com',
        password: 'Password123',
      }),
    ).rejects.toMatchObject({
      message: 'Your account is not approved yet',
      statusCode: 403,
    });
  });
});
