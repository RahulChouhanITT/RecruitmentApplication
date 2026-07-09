"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const createIo = () => {
    const roomEmit = vitest_1.vi.fn();
    const to = vitest_1.vi.fn(() => ({ emit: roomEmit }));
    return {
        to,
        roomEmit,
    };
};
(0, vitest_1.describe)('registerChatRealtimeBridge', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.resetModules();
    });
    (0, vitest_1.it)('emits chat messages to each participant room', async () => {
        const io = createIo();
        const { registerChatRealtimeBridge } = await Promise.resolve().then(() => __importStar(require('../../../src/socket/handlers/chatRealtimeBridge')));
        const { emitChatMessageCreated } = await Promise.resolve().then(() => __importStar(require('../../../src/events/chatEventBus')));
        registerChatRealtimeBridge(io);
        emitChatMessageCreated({
            participantIds: ['user-1', 'user-2'],
            message: { id: 'message-1', text: 'hello' },
        });
        (0, vitest_1.expect)(io.to).toHaveBeenNthCalledWith(1, 'user:user-1');
        (0, vitest_1.expect)(io.to).toHaveBeenNthCalledWith(2, 'user:user-2');
        (0, vitest_1.expect)(io.roomEmit).toHaveBeenNthCalledWith(1, 'chat:message', { id: 'message-1', text: 'hello' });
        (0, vitest_1.expect)(io.roomEmit).toHaveBeenNthCalledWith(2, 'chat:message', { id: 'message-1', text: 'hello' });
    });
    (0, vitest_1.it)('emits conversation updates to the target user room', async () => {
        const io = createIo();
        const { registerChatRealtimeBridge } = await Promise.resolve().then(() => __importStar(require('../../../src/socket/handlers/chatRealtimeBridge')));
        const { emitConversationUpdated } = await Promise.resolve().then(() => __importStar(require('../../../src/events/chatEventBus')));
        registerChatRealtimeBridge(io);
        emitConversationUpdated({
            updates: [
                {
                    userId: 'user-3',
                    conversationId: 'conversation-1',
                    lastMessage: 'latest',
                    lastMessageAt: new Date('2026-03-29T10:00:00.000Z'),
                    unreadCount: 4,
                },
            ],
        });
        (0, vitest_1.expect)(io.to).toHaveBeenCalledWith('user:user-3');
        (0, vitest_1.expect)(io.roomEmit).toHaveBeenCalledWith('chat:conversation_updated', {
            conversationId: 'conversation-1',
            lastMessage: 'latest',
            lastMessageAt: new Date('2026-03-29T10:00:00.000Z'),
            unreadCount: 4,
        });
    });
    (0, vitest_1.it)('registers handlers only once even if called multiple times', async () => {
        const io = createIo();
        const { registerChatRealtimeBridge } = await Promise.resolve().then(() => __importStar(require('../../../src/socket/handlers/chatRealtimeBridge')));
        const { emitConversationSeen } = await Promise.resolve().then(() => __importStar(require('../../../src/events/chatEventBus')));
        registerChatRealtimeBridge(io);
        registerChatRealtimeBridge(io);
        emitConversationSeen({
            userId: 'user-4',
            conversationId: 'conversation-2',
        });
        (0, vitest_1.expect)(io.to).toHaveBeenCalledTimes(1);
        (0, vitest_1.expect)(io.to).toHaveBeenCalledWith('user:user-4');
        (0, vitest_1.expect)(io.roomEmit).toHaveBeenCalledWith('chat:seen', {
            conversationId: 'conversation-2',
        });
    });
});
