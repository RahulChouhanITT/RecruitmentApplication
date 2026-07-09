"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const { unregisterUserPresenceMock } = vitest_1.vi.hoisted(() => ({
    unregisterUserPresenceMock: vitest_1.vi.fn(),
}));
vitest_1.vi.mock('../../../src/socket/services/presenceStore', () => ({
    unregisterUserPresence: unregisterUserPresenceMock,
}));
const disconnectHandler_1 = require("../../../src/socket/handlers/disconnectHandler");
const createSocket = (userId) => ({
    id: 'socket-1',
    data: { userId },
});
const createIo = () => ({
    emit: vitest_1.vi.fn(),
});
(0, vitest_1.describe)('createDisconnectHandler', () => {
    (0, vitest_1.beforeEach)(() => {
        unregisterUserPresenceMock.mockReset();
    });
    (0, vitest_1.it)('emits offline presence when the last socket disconnects', () => {
        const io = createIo();
        const socket = createSocket('user-1');
        unregisterUserPresenceMock.mockReturnValue(true);
        (0, disconnectHandler_1.createDisconnectHandler)(io, socket)();
        (0, vitest_1.expect)(unregisterUserPresenceMock).toHaveBeenCalledWith('user-1', 'socket-1');
        (0, vitest_1.expect)(io.emit).toHaveBeenCalledWith('presence:changed', {
            userId: 'user-1',
            isOnline: false,
        });
    });
    (0, vitest_1.it)('does not emit offline presence when the user still has active sockets', () => {
        const io = createIo();
        const socket = createSocket('user-2');
        unregisterUserPresenceMock.mockReturnValue(false);
        (0, disconnectHandler_1.createDisconnectHandler)(io, socket)();
        (0, vitest_1.expect)(io.emit).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('returns early when socket has no user id', () => {
        const io = createIo();
        const socket = createSocket();
        (0, disconnectHandler_1.createDisconnectHandler)(io, socket)();
        (0, vitest_1.expect)(unregisterUserPresenceMock).not.toHaveBeenCalled();
        (0, vitest_1.expect)(io.emit).not.toHaveBeenCalled();
    });
});
