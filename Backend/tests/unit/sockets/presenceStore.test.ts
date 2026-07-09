import { describe, expect, it } from 'vitest';
import {
  isUserOnline,
  registerUserPresence,
  unregisterUserPresence,
} from '../../../src/socket/services/presenceStore';

describe('presenceStore', () => {
  it('marks a user online after registration', () => {
    const userId = 'user-register';
    const socketId = 'socket-register';

    const wasOffline = registerUserPresence(userId, socketId);

    expect(wasOffline).toBe(true);
    expect(isUserOnline(userId)).toBe(true);

    unregisterUserPresence(userId, socketId);
  });

  it('marks a user offline after the last socket unregisters', () => {
    const userId = 'user-unregister';
    const socketId = 'socket-unregister';

    registerUserPresence(userId, socketId);
    const isNowOffline = unregisterUserPresence(userId, socketId);

    expect(isNowOffline).toBe(true);
    expect(isUserOnline(userId)).toBe(false);
  });
});
