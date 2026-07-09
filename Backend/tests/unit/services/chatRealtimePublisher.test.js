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
const emitChatMessageCreated = vitest_1.vi.fn();
const emitConversationCreated = vitest_1.vi.fn();
const emitConversationSeen = vitest_1.vi.fn();
const emitConversationUpdated = vitest_1.vi.fn();
vitest_1.vi.mock('../../../src/events/chatEventBus', () => ({
    emitChatMessageCreated,
    emitConversationCreated,
    emitConversationSeen,
    emitConversationUpdated,
}));
(0, vitest_1.describe)('dispatchChatRealtime', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('returns without publishing when realtime payload is missing', async () => {
        const { dispatchChatRealtime } = await Promise.resolve().then(() => __importStar(require('../../../src/services/chat/chatRealtimePublisher')));
        await dispatchChatRealtime(undefined);
        await dispatchChatRealtime(null);
        (0, vitest_1.expect)(emitChatMessageCreated).not.toHaveBeenCalled();
        (0, vitest_1.expect)(emitConversationUpdated).not.toHaveBeenCalled();
        (0, vitest_1.expect)(emitConversationCreated).not.toHaveBeenCalled();
        (0, vitest_1.expect)(emitConversationSeen).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('publishes message created events', async () => {
        const { dispatchChatRealtime } = await Promise.resolve().then(() => __importStar(require('../../../src/services/chat/chatRealtimePublisher')));
        const payload = {
            kind: 'messageCreated',
            participantIds: ['user-1', 'user-2'],
            message: { id: 'message-1', text: 'hello' },
        };
        await dispatchChatRealtime(payload);
        (0, vitest_1.expect)(emitChatMessageCreated).toHaveBeenCalledWith({
            participantIds: ['user-1', 'user-2'],
            message: { id: 'message-1', text: 'hello' },
        });
    });
    (0, vitest_1.it)('publishes arrays of mixed realtime payloads', async () => {
        const { dispatchChatRealtime } = await Promise.resolve().then(() => __importStar(require('../../../src/services/chat/chatRealtimePublisher')));
        await dispatchChatRealtime([
            {
                kind: 'conversationUpdated',
                updates: [
                    {
                        userId: 'user-1',
                        conversationId: 'conversation-1',
                        unreadCount: 3,
                        lastMessage: 'latest',
                        lastMessageAt: new Date('2026-03-29T10:00:00.000Z'),
                    },
                ],
            },
            {
                kind: 'conversationCreated',
                participantIds: ['user-1', 'user-3'],
                conversationId: 'conversation-2',
            },
            {
                kind: 'conversationSeen',
                userId: 'user-3',
                conversationId: 'conversation-2',
            },
        ]);
        (0, vitest_1.expect)(emitConversationUpdated).toHaveBeenCalledWith({
            updates: [
                {
                    userId: 'user-1',
                    conversationId: 'conversation-1',
                    unreadCount: 3,
                    lastMessage: 'latest',
                    lastMessageAt: new Date('2026-03-29T10:00:00.000Z'),
                },
            ],
        });
        (0, vitest_1.expect)(emitConversationCreated).toHaveBeenCalledWith({
            participantIds: ['user-1', 'user-3'],
            conversationId: 'conversation-2',
        });
        (0, vitest_1.expect)(emitConversationSeen).toHaveBeenCalledWith({
            userId: 'user-3',
            conversationId: 'conversation-2',
        });
    });
});
