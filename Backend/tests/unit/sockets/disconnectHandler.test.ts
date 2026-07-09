import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthedSocket } from '../../../src/utils/types/configurationTypes';

const { unregisterUserPresenceMock } = vi.hoisted(() => ({
  unregisterUserPresenceMock: vi.fn(),
}));

vi.mock('../../../src/socket/services/presenceStore', () => ({
  unregisterUserPresence: unregisterUserPresenceMock,
}));

import { createDisconnectHandler } from '../../../src/socket/handlers/disconnectHandler';

const createSocket = (userId?: string): AuthedSocket =>
  ({
    id: 'socket-1',
    data: { userId },
  }) as AuthedSocket;

const createIo = () =>
  ({
    emit: vi.fn(),
  }) as const;

describe('createDisconnectHandler', () => {
  beforeEach(() => {
    unregisterUserPresenceMock.mockReset();
  });

  it('emits offline presence when the last socket disconnects', () => {
    const io = createIo();
    const socket = createSocket('user-1');
    unregisterUserPresenceMock.mockReturnValue(true);

    createDisconnectHandler(io as never, socket)();

    expect(unregisterUserPresenceMock).toHaveBeenCalledWith('user-1', 'socket-1');
    expect(io.emit).toHaveBeenCalledWith('presence:changed', {
      userId: 'user-1',
      isOnline: false,
    });
  });

  it('does not emit offline presence when the user still has active sockets', () => {
    const io = createIo();
    const socket = createSocket('user-2');
    unregisterUserPresenceMock.mockReturnValue(false);

    createDisconnectHandler(io as never, socket)();

    expect(io.emit).not.toHaveBeenCalled();
  });

  it('returns early when socket has no user id', () => {
    const io = createIo();
    const socket = createSocket();

    createDisconnectHandler(io as never, socket)();

    expect(unregisterUserPresenceMock).not.toHaveBeenCalled();
    expect(io.emit).not.toHaveBeenCalled();
  });
});
