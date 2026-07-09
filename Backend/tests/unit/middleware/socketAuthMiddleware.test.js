"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const { verifyAuthenticationTokenMock } = vitest_1.vi.hoisted(() => ({
    verifyAuthenticationTokenMock: vitest_1.vi.fn(),
}));
vitest_1.vi.mock('../../../src/utils/auth/tokenHelper', () => ({
    verifyAuthenticationToken: verifyAuthenticationTokenMock,
}));
const socketAuthMiddleware_1 = require("../../../src/socket/middleware/socketAuthMiddleware");
const createSocket = ({ cookie, authToken, } = {}) => ({
    handshake: {
        headers: {
            cookie,
        },
        auth: authToken === undefined ? {} : { token: authToken },
    },
    data: {},
});
(0, vitest_1.describe)('socketAuthMiddleware', () => {
    (0, vitest_1.beforeEach)(() => {
        verifyAuthenticationTokenMock.mockReset();
    });
    (0, vitest_1.it)('authenticates with the cookie token before handshake auth token', () => {
        const socket = createSocket({
            cookie: 'authToken=cookie-token',
            authToken: 'handshake-token',
        });
        const next = vitest_1.vi.fn();
        verifyAuthenticationTokenMock.mockReturnValue({ userId: 'user-from-cookie' });
        (0, socketAuthMiddleware_1.socketAuthMiddleware)(socket, next);
        (0, vitest_1.expect)(verifyAuthenticationTokenMock).toHaveBeenCalledWith('cookie-token');
        (0, vitest_1.expect)(socket.data.userId).toBe('user-from-cookie');
        (0, vitest_1.expect)(next).toHaveBeenCalledWith();
    });
    (0, vitest_1.it)('falls back to handshake auth token when cookie token is absent', () => {
        const socket = createSocket({ authToken: 'handshake-token' });
        const next = vitest_1.vi.fn();
        verifyAuthenticationTokenMock.mockReturnValue({ userId: 'user-from-auth' });
        (0, socketAuthMiddleware_1.socketAuthMiddleware)(socket, next);
        (0, vitest_1.expect)(verifyAuthenticationTokenMock).toHaveBeenCalledWith('handshake-token');
        (0, vitest_1.expect)(socket.data.userId).toBe('user-from-auth');
        (0, vitest_1.expect)(next).toHaveBeenCalledWith();
    });
    (0, vitest_1.it)('returns unauthorized when no token is provided', () => {
        const socket = createSocket();
        const next = vitest_1.vi.fn();
        (0, socketAuthMiddleware_1.socketAuthMiddleware)(socket, next);
        (0, vitest_1.expect)(verifyAuthenticationTokenMock).not.toHaveBeenCalled();
        (0, vitest_1.expect)(next).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(next.mock.calls[0][0]).toBeInstanceOf(Error);
        (0, vitest_1.expect)(next.mock.calls[0][0]?.message).toBe('Unauthorized');
    });
    (0, vitest_1.it)('returns unauthorized when token verification throws', () => {
        const socket = createSocket({ authToken: 'bad-token' });
        const next = vitest_1.vi.fn();
        verifyAuthenticationTokenMock.mockImplementation(() => {
            throw new Error('invalid token');
        });
        (0, socketAuthMiddleware_1.socketAuthMiddleware)(socket, next);
        (0, vitest_1.expect)(next).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(next.mock.calls[0][0]).toBeInstanceOf(Error);
        (0, vitest_1.expect)(next.mock.calls[0][0]?.message).toBe('Unauthorized');
    });
});
