import type { ChatMessageItem } from '../types/chatUiTypes';
import type { ChatMessage } from '../../../types/chatTypes';
import { formatMessageDateLabel, getMessageDateKey } from '../utils/chatThreadHelpers';

export const buildChatMessageItems = (messages: ChatMessage[]): ChatMessageItem[] => {
  const items: ChatMessageItem[] = [];
  let previousDateKey = '';

  for (const message of messages) {
    const nextDateKey = getMessageDateKey(message.createdAt);

    if (nextDateKey !== previousDateKey) {
      items.push({
        type: 'date',
        key: `date-${nextDateKey}`,
        label: formatMessageDateLabel(message.createdAt),
      });
      previousDateKey = nextDateKey;
    }

    items.push({
      type: 'message',
      key: message._id,
      message,
    });
  }

  return items;
};
