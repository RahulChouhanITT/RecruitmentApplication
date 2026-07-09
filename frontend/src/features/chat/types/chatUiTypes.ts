import type { ChatMessage } from '../../../types/chatTypes';

export type ChatThreadsPanelProps = {
  hideConversationList?: boolean;
  forcedConversationId?: string;
};

export type ChatMessageItem =
  | {
      type: 'date';
      key: string;
      label: string;
    }
  | {
      type: 'message';
      key: string;
      message: ChatMessage;
    };
