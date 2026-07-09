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
const chatMessageCreate = vitest_1.vi.fn();
const chatMessageFindById = vitest_1.vi.fn();
const chatMessageCountDocuments = vitest_1.vi.fn();
const chatMessageUpdateMany = vitest_1.vi.fn();
const conversationFindById = vitest_1.vi.fn();
const conversationFindByIdAndUpdate = vitest_1.vi.fn();
const chatMessageFind = vitest_1.vi.fn();
vitest_1.vi.mock('../../../src/models/chatMessageModel', () => ({
    ChatMessageModel: {
        create: chatMessageCreate,
        findById: chatMessageFindById,
        countDocuments: chatMessageCountDocuments,
        updateMany: chatMessageUpdateMany,
        find: chatMessageFind,
        db: {
            model: vitest_1.vi.fn(() => ({
                findById: conversationFindById,
                findByIdAndUpdate: conversationFindByIdAndUpdate,
            })),
        },
    },
}));
const isUserOnline = vitest_1.vi.fn();
vitest_1.vi.mock('../../../src/socket/services/presenceStore', () => ({
    isUserOnline,
}));
const createLeanQuery = (resolvedValue) => ({
    lean: vitest_1.vi.fn().mockResolvedValue(resolvedValue),
});
const createPopulateLeanQuery = (resolvedValue) => ({
    populate: vitest_1.vi.fn().mockReturnValue({
        lean: vitest_1.vi.fn().mockResolvedValue(resolvedValue),
    }),
});
(0, vitest_1.describe)('chatMessageService', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.resetModules();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('sends a message, updates the conversation, and returns realtime payloads', async () => {
        const createdAt = new Date('2026-04-01T10:00:00.000Z');
        conversationFindById.mockReturnValue(createLeanQuery({
            _id: { toString: () => '507f1f77bcf86cd799439021' },
            participants: [
                { toString: () => '507f1f77bcf86cd799439022' },
                { toString: () => '507f1f77bcf86cd799439023' },
            ],
            lastMessage: '',
            lastMessageAt: null,
        }));
        isUserOnline.mockReturnValue(true);
        chatMessageCreate.mockResolvedValue({
            _id: { toString: () => '507f1f77bcf86cd799439024' },
            createdAt,
        });
        chatMessageFindById.mockReturnValue(createPopulateLeanQuery({
            _id: { toString: () => '507f1f77bcf86cd799439024' },
            conversationId: { toString: () => '507f1f77bcf86cd799439021' },
            senderId: {
                _id: { toString: () => '507f1f77bcf86cd799439022' },
                name: 'Ava',
                email: 'ava@example.com',
                role: 'candidate',
            },
            message: 'Hello there',
            status: 'DELIVERED',
            createdAt,
            updatedAt: createdAt,
        }));
        chatMessageCountDocuments
            .mockResolvedValueOnce(0)
            .mockResolvedValueOnce(1);
        const { sendMessageToConversation } = await Promise.resolve().then(() => __importStar(require('../../../src/services/chat/chatMessageService')));
        const result = await sendMessageToConversation('507f1f77bcf86cd799439021', '507f1f77bcf86cd799439022', '  Hello there  ');
        (0, vitest_1.expect)(chatMessageCreate).toHaveBeenCalledWith({
            conversationId: vitest_1.expect.anything(),
            senderId: vitest_1.expect.anything(),
            message: 'Hello there',
            status: 'DELIVERED',
            seenBy: [vitest_1.expect.anything()],
        });
        (0, vitest_1.expect)(conversationFindByIdAndUpdate).toHaveBeenCalled();
        (0, vitest_1.expect)(result.data).toEqual({
            _id: '507f1f77bcf86cd799439024',
            conversationId: '507f1f77bcf86cd799439021',
            sender: {
                _id: '507f1f77bcf86cd799439022',
                name: 'Ava',
                email: 'ava@example.com',
                role: 'candidate',
            },
            message: 'Hello there',
            status: 'DELIVERED',
            createdAt,
            updatedAt: createdAt,
        });
        (0, vitest_1.expect)(result.realtimePayload).toEqual([
            {
                kind: 'messageCreated',
                participantIds: ['507f1f77bcf86cd799439022', '507f1f77bcf86cd799439023'],
                message: vitest_1.expect.objectContaining({
                    _id: '507f1f77bcf86cd799439024',
                    message: 'Hello there',
                }),
            },
            {
                kind: 'conversationUpdated',
                updates: [
                    {
                        userId: '507f1f77bcf86cd799439022',
                        conversationId: '507f1f77bcf86cd799439021',
                        lastMessage: 'Hello there',
                        lastMessageAt: createdAt,
                        unreadCount: 0,
                    },
                    {
                        userId: '507f1f77bcf86cd799439023',
                        conversationId: '507f1f77bcf86cd799439021',
                        lastMessage: 'Hello there',
                        lastMessageAt: createdAt,
                        unreadCount: 1,
                    },
                ],
            },
        ]);
    });
    (0, vitest_1.it)('rejects empty trimmed messages', async () => {
        conversationFindById.mockReturnValue(createLeanQuery({
            _id: { toString: () => '507f1f77bcf86cd799439025' },
            participants: [
                { toString: () => '507f1f77bcf86cd799439026' },
                { toString: () => '507f1f77bcf86cd799439027' },
            ],
            lastMessage: '',
            lastMessageAt: null,
        }));
        const { sendMessageToConversation } = await Promise.resolve().then(() => __importStar(require('../../../src/services/chat/chatMessageService')));
        await (0, vitest_1.expect)(sendMessageToConversation('507f1f77bcf86cd799439025', '507f1f77bcf86cd799439026', '   ')).rejects.toMatchObject({
            message: 'Message cannot be empty',
            statusCode: 400,
        });
        (0, vitest_1.expect)(chatMessageCreate).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('rejects users who are not participants in the conversation', async () => {
        conversationFindById.mockReturnValue(createLeanQuery({
            _id: { toString: () => '507f1f77bcf86cd799439028' },
            participants: [
                { toString: () => '507f1f77bcf86cd799439029' },
                { toString: () => '507f1f77bcf86cd799439030' },
            ],
            lastMessage: 'Previous',
            lastMessageAt: new Date('2026-04-01T09:00:00.000Z'),
        }));
        const { sendMessageToConversation } = await Promise.resolve().then(() => __importStar(require('../../../src/services/chat/chatMessageService')));
        await (0, vitest_1.expect)(sendMessageToConversation('507f1f77bcf86cd799439028', '507f1f77bcf86cd799439031', 'Hello')).rejects.toMatchObject({
            message: 'You are not allowed to access this conversation',
            statusCode: 403,
        });
    });
    (0, vitest_1.it)('marks a conversation as seen and returns seen realtime payloads', async () => {
        const lastMessageAt = new Date('2026-04-01T08:00:00.000Z');
        conversationFindById
            .mockReturnValueOnce(createLeanQuery({
            _id: { toString: () => '507f1f77bcf86cd799439032' },
            participants: [
                { toString: () => '507f1f77bcf86cd799439033' },
                { toString: () => '507f1f77bcf86cd799439034' },
            ],
            lastMessage: 'Seen message',
            lastMessageAt,
        }))
            .mockReturnValueOnce(createLeanQuery({
            _id: { toString: () => '507f1f77bcf86cd799439032' },
            participants: [
                { toString: () => '507f1f77bcf86cd799439033' },
                { toString: () => '507f1f77bcf86cd799439034' },
            ],
            lastMessage: 'Seen message',
            lastMessageAt,
        }));
        chatMessageCountDocuments
            .mockResolvedValueOnce(0)
            .mockResolvedValueOnce(0);
        const { markConversationAsSeen } = await Promise.resolve().then(() => __importStar(require('../../../src/services/chat/chatMessageService')));
        const result = await markConversationAsSeen('507f1f77bcf86cd799439032', '507f1f77bcf86cd799439033');
        (0, vitest_1.expect)(chatMessageUpdateMany).toHaveBeenCalled();
        (0, vitest_1.expect)(result.realtimePayload).toEqual([
            {
                kind: 'conversationUpdated',
                updates: [
                    {
                        userId: '507f1f77bcf86cd799439033',
                        conversationId: '507f1f77bcf86cd799439032',
                        lastMessage: 'Seen message',
                        lastMessageAt,
                        unreadCount: 0,
                    },
                    {
                        userId: '507f1f77bcf86cd799439034',
                        conversationId: '507f1f77bcf86cd799439032',
                        lastMessage: 'Seen message',
                        lastMessageAt,
                        unreadCount: 0,
                    },
                ],
            },
            {
                kind: 'conversationSeen',
                userId: '507f1f77bcf86cd799439033',
                conversationId: '507f1f77bcf86cd799439032',
            },
        ]);
    });
});
