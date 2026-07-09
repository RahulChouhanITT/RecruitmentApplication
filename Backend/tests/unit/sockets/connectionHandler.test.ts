import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthedSocket } from '../../../src/utils/types/configurationTypes';

const { registerUserPresenceMock, createDisconnectHandlerMock } = vi.hoisted(() => ({
  registerUserPresenceMock: vi.fn(),
  createDisconnectHandlerMock: vi.fn(() => vi.fn()),
}));

vi.mock('../../../src/socket/services/presenceStore', () => ({
  registerUserPresence: registerUserPresenceMock,
}));

vi.mock('../../../src/socket/handlers/disconnectHandler', () => ({
  createDisconnectHandler: createDisconnectHandlerMock,
}));

import { createConnectionHandler } from '../../../src/socket/handlers/connectionHandler';

const createSocket = (userId?: string): AuthedSocket =>
  ({
    id: 'socket-1',
    data: { userId },
    join: vi.fn(),
    on: vi.fn(),
  }) as unknown as AuthedSocket;

const createIo = () =>
  ({
    emit: vi.fn(),
  }) as const;

describe('createConnectionHandler', () => {
  beforeEach(() => {
    registerUserPresenceMock.mockReset();
    createDisconnectHandlerMock.mockReset();
    createDisconnectHandlerMock.mockReturnValue(vi.fn());
  });

  it('joins the user room and emits online presence when the user was offline', () => {
    const io = createIo();
    const socket = createSocket('user-1');
    registerUserPresenceMock.mockReturnValue(true);

    createConnectionHandler(io as never)(socket);

    expect(socket.join).toHaveBeenCalledWith('user:user-1');
    expect(registerUserPresenceMock).toHaveBeenCalledWith('user-1', 'socket-1');
    expect(io.emit).toHaveBeenCalledWith('presence:changed', {
      userId: 'user-1',
      isOnline: true,
    });
    expect(socket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
  });

  it('does not emit presence change when the user was already online', () => {
    const io = createIo();
    const socket = createSocket('user-2');
    registerUserPresenceMock.mockReturnValue(false);

    createConnectionHandler(io as never)(socket);

    expect(io.emit).not.toHaveBeenCalled();
    expect(socket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
  });

  it('still registers the disconnect listener when user id is missing', () => {
    const io = createIo();
    const socket = createSocket();

    createConnectionHandler(io as never)(socket);

    expect(socket.join).not.toHaveBeenCalled();
    expect(registerUserPresenceMock).not.toHaveBeenCalled();
    expect(socket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
  });
});
