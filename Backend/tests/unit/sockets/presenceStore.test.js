"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const presenceStore_1 = require("../../../src/socket/services/presenceStore");
(0, vitest_1.describe)('presenceStore', () => {
    (0, vitest_1.it)('marks a user online after registration', () => {
        const userId = 'user-register';
        const socketId = 'socket-register';
        const wasOffline = (0, presenceStore_1.registerUserPresence)(userId, socketId);
        (0, vitest_1.expect)(wasOffline).toBe(true);
        (0, vitest_1.expect)((0, presenceStore_1.isUserOnline)(userId)).toBe(true);
        (0, presenceStore_1.unregisterUserPresence)(userId, socketId);
    });
    (0, vitest_1.it)('marks a user offline after the last socket unregisters', () => {
        const userId = 'user-unregister';
        const socketId = 'socket-unregister';
        (0, presenceStore_1.registerUserPresence)(userId, socketId);
        const isNowOffline = (0, presenceStore_1.unregisterUserPresence)(userId, socketId);
        (0, vitest_1.expect)(isNowOffline).toBe(true);
        (0, vitest_1.expect)((0, presenceStore_1.isUserOnline)(userId)).toBe(false);
    });
});
