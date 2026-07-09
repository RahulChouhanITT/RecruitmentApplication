"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const { registerUserPresenceMock, createDisconnectHandlerMock } = vitest_1.vi.hoisted(() => ({
    registerUserPresenceMock: vitest_1.vi.fn(),
    createDisconnectHandlerMock: vitest_1.vi.fn(() => vitest_1.vi.fn()),
}));
vitest_1.vi.mock('../../../src/socket/services/presenceStore', () => ({
    registerUserPresence: registerUserPresenceMock,
}));
vitest_1.vi.mock('../../../src/socket/handlers/disconnectHandler', () => ({
    createDisconnectHandler: createDisconnectHandlerMock,
}));
const connectionHandler_1 = require("../../../src/socket/handlers/connectionHandler");
const createSocket = (userId) => ({
    id: 'socket-1',
    data: { userId },
    join: vitest_1.vi.fn(),
    on: vitest_1.vi.fn(),
});
const createIo = () => ({
    emit: vitest_1.vi.fn(),
});
(0, vitest_1.describe)('createConnectionHandler', () => {
    (0, vitest_1.beforeEach)(() => {
        registerUserPresenceMock.mockReset();
        createDisconnectHandlerMock.mockReset();
        createDisconnectHandlerMock.mockReturnValue(vitest_1.vi.fn());
    });
    (0, vitest_1.it)('joins the user room and emits online presence when the user was offline', () => {
        const io = createIo();
        const socket = createSocket('user-1');
        registerUserPresenceMock.mockReturnValue(true);
        (0, connectionHandler_1.createConnectionHandler)(io)(socket);
        (0, vitest_1.expect)(socket.join).toHaveBeenCalledWith('user:user-1');
        (0, vitest_1.expect)(registerUserPresenceMock).toHaveBeenCalledWith('user-1', 'socket-1');
        (0, vitest_1.expect)(io.emit).toHaveBeenCalledWith('presence:changed', {
            userId: 'user-1',
            isOnline: true,
        });
        (0, vitest_1.expect)(socket.on).toHaveBeenCalledWith('disconnect', vitest_1.expect.any(Function));
    });
    (0, vitest_1.it)('does not emit presence change when the user was already online', () => {
        const io = createIo();
        const socket = createSocket('user-2');
        registerUserPresenceMock.mockReturnValue(false);
        (0, connectionHandler_1.createConnectionHandler)(io)(socket);
        (0, vitest_1.expect)(io.emit).not.toHaveBeenCalled();
        (0, vitest_1.expect)(socket.on).toHaveBeenCalledWith('disconnect', vitest_1.expect.any(Function));
    });
    (0, vitest_1.it)('still registers the disconnect listener when user id is missing', () => {
        const io = createIo();
        const socket = createSocket();
        (0, connectionHandler_1.createConnectionHandler)(io)(socket);
        (0, vitest_1.expect)(socket.join).not.toHaveBeenCalled();
        (0, vitest_1.expect)(registerUserPresenceMock).not.toHaveBeenCalled();
        (0, vitest_1.expect)(socket.on).toHaveBeenCalledWith('disconnect', vitest_1.expect.any(Function));
    });
});
