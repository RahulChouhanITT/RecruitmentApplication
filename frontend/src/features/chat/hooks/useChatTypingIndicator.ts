import { useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import type { ChatTypingEvent } from '../../../types/chatTypes';

type UseChatTypingIndicatorParams = {
  socket: Socket | null;
  activeConversationId: string;
  currentUserId: string;
  currentUserName?: string;
  draft: string;
};

const TYPING_IDLE_MS = 1400;
const TYPING_VISIBLE_MS = 2200;
const CHAT_TYPING_EVENT = 'chat:typing';

export const useChatTypingIndicator = ({
  socket,
  activeConversationId,
  currentUserId,
  currentUserName = '',
  draft,
}: UseChatTypingIndicatorParams) => {
  const [typingParticipantName, setTypingParticipantName] = useState('');
  const stopTypingTimeoutRef = useRef<number | null>(null);
  const hideIndicatorTimeoutRef = useRef<number | null>(null);
  const typingConversationIdRef = useRef('');
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!socket || !activeConversationId || !currentUserId) {
      setTypingParticipantName('');
      return;
    }

    const clearHideTimer = () => {
      if (hideIndicatorTimeoutRef.current) {
        window.clearTimeout(hideIndicatorTimeoutRef.current);
        hideIndicatorTimeoutRef.current = null;
      }
    };

    const onTyping = (payload: ChatTypingEvent): void => {
      if (
        payload.conversationId !== activeConversationId ||
        !payload.userId ||
        payload.userId === currentUserId
      ) {
        return;
      }

      clearHideTimer();

      if (payload.isTyping) {
        setTypingParticipantName(payload.userName?.trim() || 'User');
        hideIndicatorTimeoutRef.current = window.setTimeout(() => {
          setTypingParticipantName('');
          hideIndicatorTimeoutRef.current = null;
        }, TYPING_VISIBLE_MS);
        return;
      }

      setTypingParticipantName('');
    };

    socket.on(CHAT_TYPING_EVENT, onTyping);

    return () => {
      socket.off(CHAT_TYPING_EVENT, onTyping);
      clearHideTimer();
    };
  }, [activeConversationId, currentUserId, socket]);

  useEffect(() => {
    if (!socket || !currentUserId) {
      return;
    }

    const emitTyping = (conversationId: string, isTyping: boolean) => {
      socket.emit(CHAT_TYPING_EVENT, {
        conversationId,
        isTyping,
        userName: currentUserName,
      });
    };

    if (typingConversationIdRef.current && typingConversationIdRef.current !== activeConversationId) {
      emitTyping(typingConversationIdRef.current, false);
      typingConversationIdRef.current = '';
      isTypingRef.current = false;
    }

    if (!activeConversationId) {
      return;
    }

    const normalizedDraft = draft.trim();

    if (!normalizedDraft) {
      if (isTypingRef.current) {
        emitTyping(activeConversationId, false);
        isTypingRef.current = false;
        typingConversationIdRef.current = '';
      }

      if (stopTypingTimeoutRef.current) {
        window.clearTimeout(stopTypingTimeoutRef.current);
        stopTypingTimeoutRef.current = null;
      }

      return;
    }

    if (!isTypingRef.current) {
      emitTyping(activeConversationId, true);
      isTypingRef.current = true;
      typingConversationIdRef.current = activeConversationId;
    }

    if (stopTypingTimeoutRef.current) {
      window.clearTimeout(stopTypingTimeoutRef.current);
    }

    stopTypingTimeoutRef.current = window.setTimeout(() => {
      emitTyping(activeConversationId, false);
      isTypingRef.current = false;
      typingConversationIdRef.current = '';
      stopTypingTimeoutRef.current = null;
    }, TYPING_IDLE_MS);

    return () => {
      if (stopTypingTimeoutRef.current) {
        window.clearTimeout(stopTypingTimeoutRef.current);
        stopTypingTimeoutRef.current = null;
      }
    };
  }, [activeConversationId, currentUserId, currentUserName, draft, socket]);

  useEffect(
    () => () => {
      if (stopTypingTimeoutRef.current) {
        window.clearTimeout(stopTypingTimeoutRef.current);
      }
      if (hideIndicatorTimeoutRef.current) {
        window.clearTimeout(hideIndicatorTimeoutRef.current);
      }
    },
    [],
  );

  return {
    typingParticipantName,
    isSomeoneTyping: Boolean(typingParticipantName),
  };
};
