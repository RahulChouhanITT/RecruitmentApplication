import type { Server } from 'socket.io';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import {
  onChatMessageCreated,
  onConversationCreated,
  onConversationSeen,
  onConversationUpdated,
} from '../../events/chatEventBus';
import { buildUserRoom } from '../utils/socketHelpers';

let areChatEventHandlersRegistered = false;

export const registerChatRealtimeBridge = (io: Server): void => {
  if (areChatEventHandlersRegistered) {
    return;
  }

  areChatEventHandlersRegistered = true;

  onChatMessageCreated(({ participantIds, message }) => {
    for (const participantId of participantIds) {
      io.to(buildUserRoom(participantId)).emit(
        APPLICATION_CONSTANTS.SOCKET_EVENTS.CHAT_MESSAGE,
        message,
      );
    }
  });

  onConversationUpdated(({ updates }) => {
    for (const update of updates) {
      io.to(buildUserRoom(update.userId)).emit(
        APPLICATION_CONSTANTS.SOCKET_EVENTS.CONVERSATION_UPDATED,
        {
          conversationId: update.conversationId,
          lastMessage: update.lastMessage,
          lastMessageAt: update.lastMessageAt,
          unreadCount: update.unreadCount,
        },
      );
    }
  });

  onConversationCreated(({ participantIds, conversationId }) => {
    for (const participantId of participantIds) {
      io.to(buildUserRoom(participantId)).emit(
        APPLICATION_CONSTANTS.SOCKET_EVENTS.CONVERSATION_CREATED,
        {
          conversationId,
        },
      );
    }
  });

  onConversationSeen(({ userId, conversationId }) => {
    io.to(buildUserRoom(userId)).emit(APPLICATION_CONSTANTS.SOCKET_EVENTS.CHAT_SEEN, {
      conversationId,
    });
  });
};
