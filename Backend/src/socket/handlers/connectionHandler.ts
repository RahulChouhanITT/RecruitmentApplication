import type { Server } from 'socket.io';
import { ChatConversationModel } from '../../models/chatConversationModel';
import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { CONFIGURATION_CONSTANTS } from '../../utils/constants/configurationConstants';
import type { AuthedSocket } from '../../utils/types/configurationTypes';
import { registerUserPresence } from '../services/presenceStore';
import { buildUserRoom } from '../utils/socketHelpers';
import { createDisconnectHandler } from './disconnectHandler';

export const createConnectionHandler =
  (io: Server) =>
  (socket: AuthedSocket): void => {
    const userId = socket.data.userId;

    if (userId) {
      socket.join(buildUserRoom(userId));
      const wasOffline = registerUserPresence(userId, socket.id);
      if (wasOffline) {
        io.emit(CONFIGURATION_CONSTANTS.SOCKET.EVENTS.PRESENCE_CHANGED, { userId, isOnline: true });
      }
    }

    socket.on(
      APPLICATION_CONSTANTS.SOCKET_EVENTS.CHAT_TYPING,
      async (payload: {
        conversationId?: string;
        isTyping?: boolean;
        userName?: string;
      }) => {
        if (!userId || !payload?.conversationId || typeof payload.isTyping !== 'boolean') {
          return;
        }

        const conversation = await ChatConversationModel.findOne({
          _id: payload.conversationId,
          participants: userId,
        })
          .select('participants')
          .lean<{ participants: Array<{ toString: () => string } | string> } | null>();

        if (!conversation) {
          return;
        }

        conversation.participants.forEach((participantId) => {
          const participantUserId =
            typeof participantId === 'string' ? participantId : participantId.toString();

          if (participantUserId === userId) {
            return;
          }

          io.to(buildUserRoom(participantUserId)).emit(
            APPLICATION_CONSTANTS.SOCKET_EVENTS.CHAT_TYPING,
            {
              conversationId: payload.conversationId,
              isTyping: payload.isTyping,
              userId,
              userName: payload.userName ?? '',
            },
          );
        });
      },
    );

    socket.on(
      CONFIGURATION_CONSTANTS.SOCKET.EVENTS.DISCONNECT,
      createDisconnectHandler(io, socket),
    );
  };
