import { useEffect, type RefObject } from 'react';

type UseChatScrollParams = {
  messageListRef: RefObject<HTMLDivElement | null>;
  activeConversationId: string;
  messageCount: number;
};

export const useChatScroll = ({
  messageListRef,
  activeConversationId,
  messageCount,
}: UseChatScrollParams): void => {
  useEffect(() => {
    const listElement = messageListRef.current;
    if (!listElement) {
      return;
    }

    listElement.scrollTop = listElement.scrollHeight;
  }, [activeConversationId, messageCount, messageListRef]);
};
