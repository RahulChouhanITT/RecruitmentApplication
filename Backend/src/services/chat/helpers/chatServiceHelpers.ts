import { Types } from 'mongoose';
import { APPLICATION_CONSTANTS } from '../../../utils/constants/applicationConstants';
import { toIdString } from '../../../utils/common/idHelpers';
import { CHAT_MESSAGE_STATUSES } from '../../../utils/types/chatTypes';
import type {
  ChatMessageStatus,
  PopulatedChatConversationLean,
  PopulatedChatMessageLean,
  UserLite,
} from '../../../utils/types/chatTypes';
import { isUserOnline } from '../../../socket/services/presenceStore';

const [chatMessageStatusSent, chatMessageStatusDelivered, chatMessageStatusSeen] =
  CHAT_MESSAGE_STATUSES;

export const CHAT_MESSAGE_STATUS_VALUES = {
  SENT: chatMessageStatusSent,
  DELIVERED: chatMessageStatusDelivered,
  SEEN: chatMessageStatusSeen,
} as const;

export const toObjectId = (value: string): Types.ObjectId => new Types.ObjectId(value);

export const normalizeConversationParticipants = (participantIds: string[]): string[] => {
  return [...new Set(participantIds)].filter(Boolean).sort();
};

export const isCandidateHrRolePair = (currentRole: string, otherRole: string): boolean => {
  return (
    (currentRole === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE &&
      otherRole === APPLICATION_CONSTANTS.USER_ROLES.HR) ||
    (currentRole === APPLICATION_CONSTANTS.USER_ROLES.HR &&
      otherRole === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE)
  );
};

export const isHrInterviewerRolePair = (currentRole: string, otherRole: string): boolean => {
  return (
    (currentRole === APPLICATION_CONSTANTS.USER_ROLES.HR &&
      otherRole === APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER) ||
    (currentRole === APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER &&
      otherRole === APPLICATION_CONSTANTS.USER_ROLES.HR)
  );
};

export const isCandidateInterviewerRolePair = (currentRole: string, otherRole: string): boolean => {
  return (
    (currentRole === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE &&
      otherRole === APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER) ||
    (currentRole === APPLICATION_CONSTANTS.USER_ROLES.INTERVIEWER &&
      otherRole === APPLICATION_CONSTANTS.USER_ROLES.CANDIDATE)
  );
};

export const getRecipientIds = (participantIds: string[], currentUserId: string): string[] => {
  return participantIds.filter((participantId) => participantId !== currentUserId);
};

export const resolveChatMessageStatus = (recipientIds: string[]): ChatMessageStatus => {
  if (recipientIds.length === 0) {
    return CHAT_MESSAGE_STATUS_VALUES.SENT;
  }

  const isAnyRecipientOnline = recipientIds.some((recipientId) => isUserOnline(recipientId));
  return isAnyRecipientOnline
    ? CHAT_MESSAGE_STATUS_VALUES.DELIVERED
    : CHAT_MESSAGE_STATUS_VALUES.SENT;
};

export const toChatParticipantResponse = (user: UserLite) => ({
  _id: toIdString(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  isOnline: isUserOnline(toIdString(user._id)),
});

export const toChatConversationResponse = (
  conversation: PopulatedChatConversationLean,
  unreadCount: number,
) => {
  return {
    _id: toIdString(conversation._id),
    participants: conversation.participants.map(toChatParticipantResponse),
    lastMessage: conversation.lastMessage,
    lastMessageAt: conversation.lastMessageAt,
    unreadCount,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
};

export const toChatMessageResponse = (message: PopulatedChatMessageLean) => {
  return {
    _id: toIdString(message._id),
    conversationId: toIdString(message.conversationId),
    sender: {
      _id: toIdString(message.senderId._id),
      name: message.senderId.name,
      email: message.senderId.email,
      role: message.senderId.role,
    },
    message: message.message,
    status: message.status,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
};

export const mapConversationUpdates = (
  conversationId: string,
  lastMessage: string,
  lastMessageAt: Date | null,
  unreadCounts: Array<{ userId: string; unreadCount: number }>,
) => {
  return unreadCounts.map(({ userId, unreadCount }) => ({
    userId,
    conversationId,
    lastMessage,
    lastMessageAt,
    unreadCount,
  }));
};
