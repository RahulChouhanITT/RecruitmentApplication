import {
  emitChatMessageCreated,
  emitConversationCreated,
  emitConversationSeen,
  emitConversationUpdated,
} from '../../events/chatEventBus';
import type { ChatRealtimePayload } from '../../utils/types';

const publishRealtimeEvent = async (realtimePayload: ChatRealtimePayload): Promise<void> => {
  switch (realtimePayload.kind) {
    case 'messageCreated':
      emitChatMessageCreated({
        participantIds: realtimePayload.participantIds,
        message: realtimePayload.message,
      });
      return;
    case 'conversationUpdated':
      emitConversationUpdated({ updates: realtimePayload.updates });
      return;
    case 'conversationCreated':
      emitConversationCreated({
        participantIds: realtimePayload.participantIds,
        conversationId: realtimePayload.conversationId,
      });
      return;
    case 'conversationSeen':
      emitConversationSeen({
        userId: realtimePayload.userId,
        conversationId: realtimePayload.conversationId,
      });
      return;
    default:
      return;
  }
};

export const dispatchChatRealtime = async (
  realtimePayload?: ChatRealtimePayload | ChatRealtimePayload[] | null,
): Promise<void> => {
  if (!realtimePayload) {
    return;
  }

  const events = Array.isArray(realtimePayload) ? realtimePayload : [realtimePayload];
  await Promise.all(events.map(publishRealtimeEvent));
};
