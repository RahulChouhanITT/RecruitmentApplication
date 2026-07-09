import { useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { useAppDispatch } from '../../../app/hooks';
import type { ChatMessage } from '../../../types/chatTypes';
import { chatApi, useMarkSeenMutation } from '../api/chatApi';
import { getChatErrorMessage } from '../handlers/chatErrorHandler';
import { updateConversationCache, updateConversationPresence } from '../utils/chatCacheHelpers';

type ConversationUpdatedEvent = {
  conversationId?: string;
  unreadCount?: number;
  lastMessage?: string;
  lastMessageAt?: string | null;
};

type PresenceChangedEvent = {
  userId?: string;
  isOnline?: boolean;
};

type UseChatRealtimeHandlerParams = {
  socket: Socket | null;
  currentUserId?: string;
  activeConversationId?: string;
  activeConversationUnreadCount?: number;
  onError?: (message: string) => void;
};

const appendMessageIfMissing = (messages: ChatMessage[], nextMessage: ChatMessage): ChatMessage[] => {
  if (messages.some((message) => message._id === nextMessage._id)) {
    return messages;
  }

  return [...messages, nextMessage].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
};

export const useChatRealtimeHandler = ({
  socket,
  currentUserId = '',
  activeConversationId = '',
  activeConversationUnreadCount = 0,
  onError,
}: UseChatRealtimeHandlerParams): void => {
  const dispatch = useAppDispatch();
  const [markSeen] = useMarkSeenMutation();
  const activeConversationIdRef = useRef(activeConversationId);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
    onErrorRef.current = onError;
  }, [activeConversationId, onError]);

  useEffect(() => {
    if (!socket || !currentUserId) {
      return;
    }

    const onChatMessage = (payload: ChatMessage): void => {
      if (!payload?.conversationId || payload.conversationId !== activeConversationIdRef.current) {
        return;
      }

      dispatch(
        chatApi.util.updateQueryData('getMessages', { conversationId: payload.conversationId }, (draft) => {
          draft.data = appendMessageIfMissing(draft.data ?? [], payload);
        }),
      );
    };

    const onConversationUpdated = (payload: ConversationUpdatedEvent): void => {
      dispatch(
        chatApi.util.updateQueryData('getConversations', undefined, (draft) => {
          draft.data = updateConversationCache(draft.data ?? [], payload);
        }),
      );
    };

    const onConversationCreated = (): void => {
      dispatch(chatApi.util.invalidateTags([{ type: 'ChatConversations', id: 'LIST' }]));
    };

    const onPresenceChanged = (payload: PresenceChangedEvent): void => {
      dispatch(
        chatApi.util.updateQueryData('getConversations', undefined, (draft) => {
          updateConversationPresence(draft.data ?? [], payload);
        }),
      );
    };

    socket.on('chat:message', onChatMessage);
    socket.on('chat:conversation_updated', onConversationUpdated);
    socket.on('chat:conversation_created', onConversationCreated);
    socket.on('presence:changed', onPresenceChanged);

    return () => {
      socket.off('chat:message', onChatMessage);
      socket.off('chat:conversation_updated', onConversationUpdated);
      socket.off('chat:conversation_created', onConversationCreated);
      socket.off('presence:changed', onPresenceChanged);
    };
  }, [currentUserId, dispatch, socket]);

  useEffect(() => {
    if (!activeConversationId || activeConversationUnreadCount <= 0) {
      return;
    }

    void markSeen({ conversationId: activeConversationId })
      .unwrap()
      .catch((error: unknown) => {
        onErrorRef.current?.(
          getChatErrorMessage(error, 'Unable to update read status right now.'),
        );
      });
  }, [activeConversationId, activeConversationUnreadCount, markSeen]);
};
