import { beforeEach, describe, expect, it, vi } from 'vitest';

const emitChatMessageCreated = vi.fn();
const emitConversationCreated = vi.fn();
const emitConversationSeen = vi.fn();
const emitConversationUpdated = vi.fn();

vi.mock('../../../src/events/chatEventBus', () => ({
  emitChatMessageCreated,
  emitConversationCreated,
  emitConversationSeen,
  emitConversationUpdated,
}));

describe('dispatchChatRealtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns without publishing when realtime payload is missing', async () => {
    const { dispatchChatRealtime } = await import('../../../src/services/chat/chatRealtimePublisher');

    await dispatchChatRealtime(undefined);
    await dispatchChatRealtime(null);

    expect(emitChatMessageCreated).not.toHaveBeenCalled();
    expect(emitConversationUpdated).not.toHaveBeenCalled();
    expect(emitConversationCreated).not.toHaveBeenCalled();
    expect(emitConversationSeen).not.toHaveBeenCalled();
  });

  it('publishes message created events', async () => {
    const { dispatchChatRealtime } = await import('../../../src/services/chat/chatRealtimePublisher');
    const payload = {
      kind: 'messageCreated' as const,
      participantIds: ['user-1', 'user-2'],
      message: { id: 'message-1', text: 'hello' },
    };

    await dispatchChatRealtime(payload);

    expect(emitChatMessageCreated).toHaveBeenCalledWith({
      participantIds: ['user-1', 'user-2'],
      message: { id: 'message-1', text: 'hello' },
    });
  });

  it('publishes arrays of mixed realtime payloads', async () => {
    const { dispatchChatRealtime } = await import('../../../src/services/chat/chatRealtimePublisher');

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

    expect(emitConversationUpdated).toHaveBeenCalledWith({
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
    expect(emitConversationCreated).toHaveBeenCalledWith({
      participantIds: ['user-1', 'user-3'],
      conversationId: 'conversation-2',
    });
    expect(emitConversationSeen).toHaveBeenCalledWith({
      userId: 'user-3',
      conversationId: 'conversation-2',
    });
  });
});
