import type { ChatConversation } from '../../../types/chatTypes';
import { CHAT_UI_LABELS } from '../labels/chatLabels';

export const getActiveConversationView = (
  conversations: ChatConversation[],
  activeConversationId: string,
  currentUserId: string,
): {
  activeConversation: ChatConversation | null;
  activeTitle: string;
  activePresence: 'online' | 'offline';
} => {
  const activeConversation =
    conversations.find((conversation) => conversation._id === activeConversationId) ?? null;
  const activeParticipant =
    (activeConversation?.participants ?? []).find(
      (participant) => participant?._id !== currentUserId,
    ) ??
    null;

  return {
    activeConversation,
    activeTitle: activeParticipant?.name ?? CHAT_UI_LABELS.DEFAULT_TITLE,
    activePresence: activeParticipant?.isOnline ? 'online' : 'offline',
  };
};
