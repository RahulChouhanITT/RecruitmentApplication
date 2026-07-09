import type { ChatConversation } from '../../../types/chatTypes';

export const getChatAvatarText = (name: string): string => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) {
    return 'U';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export const updateConversationCache = (
  conversations: ChatConversation[],
  payload: {
    conversationId?: string;
    unreadCount?: number;
    lastMessage?: string;
    lastMessageAt?: string | null;
  },
): ChatConversation[] => {
  if (!payload.conversationId) {
    return conversations;
  }

  const targetConversation = conversations.find(
    (conversation) => conversation._id === payload.conversationId,
  );
  if (!targetConversation) {
    return conversations;
  }

  if (typeof payload.unreadCount === 'number') {
    targetConversation.unreadCount = payload.unreadCount;
  }
  if (typeof payload.lastMessage === 'string') {
    targetConversation.lastMessage = payload.lastMessage;
  }
  if (payload.lastMessageAt !== undefined) {
    targetConversation.lastMessageAt = payload.lastMessageAt;
  }

  conversations.sort((left, right) => {
    const leftTime = left.lastMessageAt ? new Date(left.lastMessageAt).getTime() : 0;
    const rightTime = right.lastMessageAt ? new Date(right.lastMessageAt).getTime() : 0;
    return rightTime - leftTime;
  });

  return conversations;
};

export const updateConversationPresence = (
  conversations: ChatConversation[],
  payload: { userId?: string; isOnline?: boolean },
): void => {
  if (!payload.userId || typeof payload.isOnline !== 'boolean') {
    return;
  }

  conversations.forEach((conversation) => {
    conversation.participants.forEach((participant) => {
      if (participant._id === payload.userId) {
        participant.isOnline = payload.isOnline;
      }
    });
  });
};
