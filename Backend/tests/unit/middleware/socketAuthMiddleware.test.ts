import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthedSocket } from '../../../src/utils/types/configurationTypes';

const { verifyAuthenticationTokenMock } = vi.hoisted(() => ({
  verifyAuthenticationTokenMock: vi.fn(),
}));

vi.mock('../../../src/utils/auth/tokenHelper', () => ({
  verifyAuthenticationToken: verifyAuthenticationTokenMock,
}));

import { socketAuthMiddleware } from '../../../src/socket/middleware/socketAuthMiddleware';

const createSocket = ({
  cookie,
  authToken,
}: {
  cookie?: string;
  authToken?: unknown;
} = {}): AuthedSocket =>
  ({
    handshake: {
      headers: {
        cookie,
      },
      auth: authToken === undefined ? {} : { token: authToken },
    },
    data: {},
  }) as AuthedSocket;

describe('socketAuthMiddleware', () => {
  beforeEach(() => {
    verifyAuthenticationTokenMock.mockReset();
  });

  it('authenticates with the cookie token before handshake auth token', () => {
    const socket = createSocket({
      cookie: 'authToken=cookie-token',
      authToken: 'handshake-token',
    });
    const next = vi.fn();

    verifyAuthenticationTokenMock.mockReturnValue({ userId: 'user-from-cookie' });

    socketAuthMiddleware(socket, next);

    expect(verifyAuthenticationTokenMock).toHaveBeenCalledWith('cookie-token');
    expect(socket.data.userId).toBe('user-from-cookie');
    expect(next).toHaveBeenCalledWith();
  });

  it('falls back to handshake auth token when cookie token is absent', () => {
    const socket = createSocket({ authToken: 'handshake-token' });
    const next = vi.fn();

    verifyAuthenticationTokenMock.mockReturnValue({ userId: 'user-from-auth' });

    socketAuthMiddleware(socket, next);

    expect(verifyAuthenticationTokenMock).toHaveBeenCalledWith('handshake-token');
    expect(socket.data.userId).toBe('user-from-auth');
    expect(next).toHaveBeenCalledWith();
  });

  it('returns unauthorized when no token is provided', () => {
    const socket = createSocket();
    const next = vi.fn();

    socketAuthMiddleware(socket, next);

    expect(verifyAuthenticationTokenMock).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(next.mock.calls[0][0]?.message).toBe('Unauthorized');
  });

  it('returns unauthorized when token verification throws', () => {
    const socket = createSocket({ authToken: 'bad-token' });
    const next = vi.fn();

    verifyAuthenticationTokenMock.mockImplementation(() => {
      throw new Error('invalid token');
    });

    socketAuthMiddleware(socket, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(next.mock.calls[0][0]?.message).toBe('Unauthorized');
  });
});
