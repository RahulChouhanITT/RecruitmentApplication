import { beforeEach, describe, expect, it, vi } from 'vitest';

const createIo = () => {
  const roomEmit = vi.fn();
  const to = vi.fn(() => ({ emit: roomEmit }));

  return {
    to,
    roomEmit,
  };
};

describe('registerChatRealtimeBridge', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('emits chat messages to each participant room', async () => {
    const io = createIo();
    const { registerChatRealtimeBridge } = await import('../../../src/socket/handlers/chatRealtimeBridge');
    const { emitChatMessageCreated } = await import('../../../src/events/chatEventBus');

    registerChatRealtimeBridge(io as never);
    emitChatMessageCreated({
      participantIds: ['user-1', 'user-2'],
      message: { id: 'message-1', text: 'hello' },
    });

    expect(io.to).toHaveBeenNthCalledWith(1, 'user:user-1');
    expect(io.to).toHaveBeenNthCalledWith(2, 'user:user-2');
    expect(io.roomEmit).toHaveBeenNthCalledWith(1, 'chat:message', { id: 'message-1', text: 'hello' });
    expect(io.roomEmit).toHaveBeenNthCalledWith(2, 'chat:message', { id: 'message-1', text: 'hello' });
  });

  it('emits conversation updates to the target user room', async () => {
    const io = createIo();
    const { registerChatRealtimeBridge } = await import('../../../src/socket/handlers/chatRealtimeBridge');
    const { emitConversationUpdated } = await import('../../../src/events/chatEventBus');

    registerChatRealtimeBridge(io as never);
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

    expect(io.to).toHaveBeenCalledWith('user:user-3');
    expect(io.roomEmit).toHaveBeenCalledWith('chat:conversation_updated', {
      conversationId: 'conversation-1',
      lastMessage: 'latest',
      lastMessageAt: new Date('2026-03-29T10:00:00.000Z'),
      unreadCount: 4,
    });
  });

  it('registers handlers only once even if called multiple times', async () => {
    const io = createIo();
    const { registerChatRealtimeBridge } = await import('../../../src/socket/handlers/chatRealtimeBridge');
    const { emitConversationSeen } = await import('../../../src/events/chatEventBus');

    registerChatRealtimeBridge(io as never);
    registerChatRealtimeBridge(io as never);
    emitConversationSeen({
      userId: 'user-4',
      conversationId: 'conversation-2',
    });

    expect(io.to).toHaveBeenCalledTimes(1);
    expect(io.to).toHaveBeenCalledWith('user:user-4');
    expect(io.roomEmit).toHaveBeenCalledWith('chat:seen', {
      conversationId: 'conversation-2',
    });
  });
});
