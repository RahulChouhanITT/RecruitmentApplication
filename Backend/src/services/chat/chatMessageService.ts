import { ChatMessageModel } from '../../models/chatMessageModel';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { ApplicationError } from '../../utils/errors/applicationError';
import { APPLICATION_MESSAGES } from '../../utils/messages/applicationMessages';
import { CHAT_SENDER_POPULATION_FIELDS } from '../../utils/constants';
import {
  type ChatRealtimePayload,
  type ChatConversationLean,
  type PopulatedChatMessageLean,
  type ServiceResult,
} from '../../utils/types';
import {
  CHAT_MESSAGE_STATUS_VALUES,
  getRecipientIds,
  mapConversationUpdates,
  toChatMessageResponse,
  toObjectId,
  resolveChatMessageStatus,
} from './helpers/chatServiceHelpers';

const getConversationOrThrow = async (
  conversationId: string,
  userId: string,
): Promise<ChatConversationLean> => {
  const conversation = await ChatMessageModel.db
    .model('ChatConversation')
    .findById(conversationId)
    .lean<ChatConversationLean | null>();
  if (!conversation) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.CHAT.CONVERSATION_NOT_FOUND,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND,
    );
  }

  const participantIds = conversation.participants.map((participantId) => participantId.toString());
  if (!participantIds.includes(userId)) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.CHAT.CONVERSATION_ACCESS_FORBIDDEN,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.FORBIDDEN,
    );
  }

  return conversation;
};

const countUnreadForConversation = async (
  conversationId: string,
  userId: string,
): Promise<number> => {
  return ChatMessageModel.countDocuments({
    conversationId: toObjectId(conversationId),
    senderId: { $ne: toObjectId(userId) },
    seenBy: { $ne: toObjectId(userId) },
  });
};

const buildConversationUpdateEvents = async (
  conversationId: string,
  participantIds: string[],
  lastMessage: string,
  lastMessageAt: Date | null,
) => {
  const unreadCounts = await Promise.all(
    participantIds.map(async (participantId) => ({
      userId: participantId,
      unreadCount: await countUnreadForConversation(conversationId, participantId),
    })),
  );

  return mapConversationUpdates(conversationId, lastMessage, lastMessageAt, unreadCounts);
};

export const getMessagesForConversation = async (conversationId: string, userId: string) => {
  await getConversationOrThrow(conversationId, userId);
  const messages = await ChatMessageModel.find({ conversationId: toObjectId(conversationId) })
    .populate('senderId', CHAT_SENDER_POPULATION_FIELDS)
    .sort({ createdAt: 1 })
    .lean<PopulatedChatMessageLean[]>();

  return messages.map(toChatMessageResponse);
};

export const sendMessageToConversation = async (
  conversationId: string,
  userId: string,
  message: string,
): Promise<
  ServiceResult<ReturnType<typeof toChatMessageResponse>, null, null, ChatRealtimePayload[]>
> => {
  const conversation = await getConversationOrThrow(conversationId, userId);
  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.CHAT.MESSAGE_REQUIRED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST,
    );
  }

  const participantIds = conversation.participants.map((participantId) => participantId.toString());
  const recipientIds = getRecipientIds(participantIds, userId);

  const createdMessage = await ChatMessageModel.create({
    conversationId: toObjectId(conversationId),
    senderId: toObjectId(userId),
    message: trimmedMessage,
    status: resolveChatMessageStatus(recipientIds),
    seenBy: [toObjectId(userId)],
  });

  await ChatMessageModel.db
    .model('ChatConversation')
    .findByIdAndUpdate(toObjectId(conversationId), {
      lastMessage: trimmedMessage,
      lastMessageAt: createdMessage.createdAt,
    });

  const populatedMessage = await ChatMessageModel.findById(createdMessage._id)
    .populate('senderId', CHAT_SENDER_POPULATION_FIELDS)
    .lean<PopulatedChatMessageLean | null>();
  if (!populatedMessage) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.CHAT.MESSAGE_SEND_FAILED,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    );
  }

  const responseMessage = toChatMessageResponse(populatedMessage);

  const conversationUpdates = await buildConversationUpdateEvents(
    conversationId,
    participantIds,
    trimmedMessage,
    createdMessage.createdAt,
  );
  return {
    data: responseMessage,
    realtimePayload: [
      {
        kind: 'messageCreated',
        participantIds,
        message: responseMessage,
      },
      {
        kind: 'conversationUpdated',
        updates: conversationUpdates,
      },
    ],
  };
};

export const markConversationAsSeen = async (
  conversationId: string,
  userId: string,
): Promise<ServiceResult<null, null, null, ChatRealtimePayload[]>> => {
  await getConversationOrThrow(conversationId, userId);

  await ChatMessageModel.updateMany(
    {
      conversationId: toObjectId(conversationId),
      senderId: { $ne: toObjectId(userId) },
      seenBy: { $ne: toObjectId(userId) },
    },
    {
      $addToSet: { seenBy: toObjectId(userId) },
      $set: { status: CHAT_MESSAGE_STATUS_VALUES.SEEN },
    },
  );

  const conversation = await ChatMessageModel.db
    .model('ChatConversation')
    .findById(toObjectId(conversationId))
    .lean<ChatConversationLean | null>();
  if (!conversation) {
    throw new ApplicationError(
      APPLICATION_MESSAGES.CHAT.CONVERSATION_NOT_FOUND,
      APPLICATION_CONSTANTS.HTTP_STATUS_CODES.NOT_FOUND,
    );
  }

  const participantIds = conversation.participants.map((participantId) => participantId.toString());
  const conversationUpdates = await buildConversationUpdateEvents(
    conversationId,
    participantIds,
    conversation.lastMessage,
    conversation.lastMessageAt,
  );
  return {
    data: null,
    realtimePayload: [
      {
        kind: 'conversationUpdated',
        updates: conversationUpdates,
      },
      {
        kind: 'conversationSeen',
        userId,
        conversationId,
      },
    ],
  };
};
