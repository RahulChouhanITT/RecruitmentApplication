import type { ChatConversation, ChatMessage } from '../../../types/chatTypes';
import { CHAT_UI_LABELS } from '../labels/chatLabels';
import { getChatAvatarText } from '../utils/chatCacheHelpers';
import { formatConversationTime, formatMessageTime } from '../utils/chatThreadHelpers';

export const getConversationListItemView = (
  conversation: ChatConversation,
  currentUserId: string,
): {
  title: string;
  subtitle: string;
  avatarText: string;
  lastMessageTime: string;
  lastMessage: string;
  unreadCount: number;
} => {
  const counterpart = (conversation.participants ?? []).find(
    (participant) => participant?._id !== currentUserId,
  );
  const title = counterpart?.name ?? CHAT_UI_LABELS.DEFAULT_TITLE;

  return {
    title,
    subtitle: counterpart?.role ?? '',
    avatarText: getChatAvatarText(title),
    lastMessageTime: formatConversationTime(conversation.lastMessageAt ?? null),
    lastMessage: conversation.lastMessage || CHAT_UI_LABELS.DEFAULT_LAST_MESSAGE,
    unreadCount: conversation.unreadCount ?? 0,
  };
};

export const getMessageView = (
  message: ChatMessage,
  currentUserId: string,
): {
  isMine: boolean;
  authorName: string;
  sentAtLabel: string;
} => {
  const senderId = message.sender?._id ?? '';
  const authorName = message.sender?.name?.trim() || CHAT_UI_LABELS.DEFAULT_TITLE;

  return {
    isMine: senderId === currentUserId,
    authorName,
    sentAtLabel: formatMessageTime(message.createdAt ?? ''),
  };
};
