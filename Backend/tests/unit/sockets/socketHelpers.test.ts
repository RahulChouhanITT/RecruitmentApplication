import { describe, expect, it } from 'vitest';
import {
  buildUserRoom,
  getSocketHandshakeAuthToken,
  parseTokenFromCookieHeader,
} from '../../../src/socket/utils/socketHelpers';
import type { AuthedSocket } from '../../../src/utils/types/configurationTypes';

const createSocket = (token?: unknown): AuthedSocket =>
  ({
    handshake: {
      auth: token === undefined ? {} : { token },
      headers: {},
    },
    data: {},
  }) as AuthedSocket;

describe('socketHelpers', () => {
  describe('parseTokenFromCookieHeader', () => {
    it('returns null when cookie header is missing', () => {
      expect(parseTokenFromCookieHeader(undefined)).toBeNull();
    });

    it('returns the auth token from the cookie header', () => {
      const cookieHeader = 'foo=bar; authToken=test-token-123; theme=dark';

      expect(parseTokenFromCookieHeader(cookieHeader)).toBe('test-token-123');
    });

    it('decodes encoded cookie values', () => {
      const cookieHeader = 'authToken=token%20with%20spaces';

      expect(parseTokenFromCookieHeader(cookieHeader)).toBe('token with spaces');
    });

    it('returns null when auth token cookie is not present', () => {
      const cookieHeader = 'foo=bar; theme=dark';

      expect(parseTokenFromCookieHeader(cookieHeader)).toBeNull();
    });
  });

  describe('getSocketHandshakeAuthToken', () => {
    it('returns the auth token when handshake auth token is a string', () => {
      expect(getSocketHandshakeAuthToken(createSocket('socket-token'))).toBe('socket-token');
    });

    it('returns null when handshake auth token is not a string', () => {
      expect(getSocketHandshakeAuthToken(createSocket(123))).toBeNull();
    });
  });

  describe('buildUserRoom', () => {
    it('builds the room name with the user prefix', () => {
      expect(buildUserRoom('user-42')).toBe('user:user-42');
    });
  });
});
