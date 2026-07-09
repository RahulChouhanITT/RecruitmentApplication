"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const socketHelpers_1 = require("../../../src/socket/utils/socketHelpers");
const createSocket = (token) => ({
    handshake: {
        auth: token === undefined ? {} : { token },
        headers: {},
    },
    data: {},
});
(0, vitest_1.describe)('socketHelpers', () => {
    (0, vitest_1.describe)('parseTokenFromCookieHeader', () => {
        (0, vitest_1.it)('returns null when cookie header is missing', () => {
            (0, vitest_1.expect)((0, socketHelpers_1.parseTokenFromCookieHeader)(undefined)).toBeNull();
        });
        (0, vitest_1.it)('returns the auth token from the cookie header', () => {
            const cookieHeader = 'foo=bar; authToken=test-token-123; theme=dark';
            (0, vitest_1.expect)((0, socketHelpers_1.parseTokenFromCookieHeader)(cookieHeader)).toBe('test-token-123');
        });
        (0, vitest_1.it)('decodes encoded cookie values', () => {
            const cookieHeader = 'authToken=token%20with%20spaces';
            (0, vitest_1.expect)((0, socketHelpers_1.parseTokenFromCookieHeader)(cookieHeader)).toBe('token with spaces');
        });
        (0, vitest_1.it)('returns null when auth token cookie is not present', () => {
            const cookieHeader = 'foo=bar; theme=dark';
            (0, vitest_1.expect)((0, socketHelpers_1.parseTokenFromCookieHeader)(cookieHeader)).toBeNull();
        });
    });
    (0, vitest_1.describe)('getSocketHandshakeAuthToken', () => {
        (0, vitest_1.it)('returns the auth token when handshake auth token is a string', () => {
            (0, vitest_1.expect)((0, socketHelpers_1.getSocketHandshakeAuthToken)(createSocket('socket-token'))).toBe('socket-token');
        });
        (0, vitest_1.it)('returns null when handshake auth token is not a string', () => {
            (0, vitest_1.expect)((0, socketHelpers_1.getSocketHandshakeAuthToken)(createSocket(123))).toBeNull();
        });
    });
    (0, vitest_1.describe)('buildUserRoom', () => {
        (0, vitest_1.it)('builds the room name with the user prefix', () => {
            (0, vitest_1.expect)((0, socketHelpers_1.buildUserRoom)('user-42')).toBe('user:user-42');
        });
    });
});
