import { beforeEach, describe, expect, it, vi } from 'vitest';

const chatMessageCreate = vi.fn();
const chatMessageFindById = vi.fn();
const chatMessageCountDocuments = vi.fn();
const chatMessageUpdateMany = vi.fn();
const conversationFindById = vi.fn();
const conversationFindByIdAndUpdate = vi.fn();
const chatMessageFind = vi.fn();

vi.mock('../../../src/models/chatMessageModel', () => ({
  ChatMessageModel: {
    create: chatMessageCreate,
    findById: chatMessageFindById,
    countDocuments: chatMessageCountDocuments,
    updateMany: chatMessageUpdateMany,
    find: chatMessageFind,
    db: {
      model: vi.fn(() => ({
        findById: conversationFindById,
        findByIdAndUpdate: conversationFindByIdAndUpdate,
      })),
    },
  },
}));

const isUserOnline = vi.fn();

vi.mock('../../../src/socket/services/presenceStore', () => ({
  isUserOnline,
}));

const createLeanQuery = (resolvedValue: unknown) => ({
  lean: vi.fn().mockResolvedValue(resolvedValue),
});

const createPopulateLeanQuery = (resolvedValue: unknown) => ({
  populate: vi.fn().mockReturnValue({
    lean: vi.fn().mockResolvedValue(resolvedValue),
  }),
});

describe('chatMessageService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('sends a message, updates the conversation, and returns realtime payloads', async () => {
    const createdAt = new Date('2026-04-01T10:00:00.000Z');
    conversationFindById.mockReturnValue(
      createLeanQuery({
        _id: { toString: () => '507f1f77bcf86cd799439021' },
        participants: [
          { toString: () => '507f1f77bcf86cd799439022' },
          { toString: () => '507f1f77bcf86cd799439023' },
        ],
        lastMessage: '',
        lastMessageAt: null,
      }),
    );
    isUserOnline.mockReturnValue(true);
    chatMessageCreate.mockResolvedValue({
      _id: { toString: () => '507f1f77bcf86cd799439024' },
      createdAt,
    });
    chatMessageFindById.mockReturnValue(
      createPopulateLeanQuery({
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
      }),
    );
    chatMessageCountDocuments
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(1);

    const { sendMessageToConversation } = await import(
      '../../../src/services/chat/chatMessageService'
    );

    const result = await sendMessageToConversation(
      '507f1f77bcf86cd799439021',
      '507f1f77bcf86cd799439022',
      '  Hello there  ',
    );

    expect(chatMessageCreate).toHaveBeenCalledWith({
      conversationId: expect.anything(),
      senderId: expect.anything(),
      message: 'Hello there',
      status: 'DELIVERED',
      seenBy: [expect.anything()],
    });
    expect(conversationFindByIdAndUpdate).toHaveBeenCalled();
    expect(result.data).toEqual({
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
    expect(result.realtimePayload).toEqual([
      {
        kind: 'messageCreated',
        participantIds: ['507f1f77bcf86cd799439022', '507f1f77bcf86cd799439023'],
        message: expect.objectContaining({
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

  it('rejects empty trimmed messages', async () => {
    conversationFindById.mockReturnValue(
      createLeanQuery({
        _id: { toString: () => '507f1f77bcf86cd799439025' },
        participants: [
          { toString: () => '507f1f77bcf86cd799439026' },
          { toString: () => '507f1f77bcf86cd799439027' },
        ],
        lastMessage: '',
        lastMessageAt: null,
      }),
    );

    const { sendMessageToConversation } = await import(
      '../../../src/services/chat/chatMessageService'
    );

    await expect(
      sendMessageToConversation(
        '507f1f77bcf86cd799439025',
        '507f1f77bcf86cd799439026',
        '   ',
      ),
    ).rejects.toMatchObject({
      message: 'Message cannot be empty',
      statusCode: 400,
    });
    expect(chatMessageCreate).not.toHaveBeenCalled();
  });

  it('rejects users who are not participants in the conversation', async () => {
    conversationFindById.mockReturnValue(
      createLeanQuery({
        _id: { toString: () => '507f1f77bcf86cd799439028' },
        participants: [
          { toString: () => '507f1f77bcf86cd799439029' },
          { toString: () => '507f1f77bcf86cd799439030' },
        ],
        lastMessage: 'Previous',
        lastMessageAt: new Date('2026-04-01T09:00:00.000Z'),
      }),
    );

    const { sendMessageToConversation } = await import(
      '../../../src/services/chat/chatMessageService'
    );

    await expect(
      sendMessageToConversation(
        '507f1f77bcf86cd799439028',
        '507f1f77bcf86cd799439031',
        'Hello',
      ),
    ).rejects.toMatchObject({
      message: 'You are not allowed to access this conversation',
      statusCode: 403,
    });
  });

  it('marks a conversation as seen and returns seen realtime payloads', async () => {
    const lastMessageAt = new Date('2026-04-01T08:00:00.000Z');
    conversationFindById
      .mockReturnValueOnce(
        createLeanQuery({
          _id: { toString: () => '507f1f77bcf86cd799439032' },
          participants: [
            { toString: () => '507f1f77bcf86cd799439033' },
            { toString: () => '507f1f77bcf86cd799439034' },
          ],
          lastMessage: 'Seen message',
          lastMessageAt,
        }),
      )
      .mockReturnValueOnce(
        createLeanQuery({
          _id: { toString: () => '507f1f77bcf86cd799439032' },
          participants: [
            { toString: () => '507f1f77bcf86cd799439033' },
            { toString: () => '507f1f77bcf86cd799439034' },
          ],
          lastMessage: 'Seen message',
          lastMessageAt,
        }),
      );
    chatMessageCountDocuments
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    const { markConversationAsSeen } = await import(
      '../../../src/services/chat/chatMessageService'
    );

    const result = await markConversationAsSeen(
      '507f1f77bcf86cd799439032',
      '507f1f77bcf86cd799439033',
    );

    expect(chatMessageUpdateMany).toHaveBeenCalled();
    expect(result.realtimePayload).toEqual([
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
