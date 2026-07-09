import type {
  ChatMessageCreatedEvent,
  ConversationCreatedEvent,
  ConversationSeenEvent,
  ConversationUpdatedEvent,
} from '../utils/types/chatTypes';
import { appEventBus } from './eventBus';

const CHAT_EVENT_NAMES = {
  MESSAGE_CREATED: 'messageCreated',
  CONVERSATION_UPDATED: 'conversationUpdated',
  CONVERSATION_CREATED: 'conversationCreated',
  CONVERSATION_SEEN: 'conversationSeen',
} as const;

export const emitChatMessageCreated = (event: ChatMessageCreatedEvent): void => {
  appEventBus.emit(CHAT_EVENT_NAMES.MESSAGE_CREATED, event);
};

export const onChatMessageCreated = (listener: (event: ChatMessageCreatedEvent) => void): void => {
  appEventBus.on(CHAT_EVENT_NAMES.MESSAGE_CREATED, listener);
};

export const emitConversationUpdated = (event: ConversationUpdatedEvent): void => {
  appEventBus.emit(CHAT_EVENT_NAMES.CONVERSATION_UPDATED, event);
};

export const onConversationUpdated = (
  listener: (event: ConversationUpdatedEvent) => void,
): void => {
  appEventBus.on(CHAT_EVENT_NAMES.CONVERSATION_UPDATED, listener);
};

export const emitConversationCreated = (event: ConversationCreatedEvent): void => {
  appEventBus.emit(CHAT_EVENT_NAMES.CONVERSATION_CREATED, event);
};

export const onConversationCreated = (
  listener: (event: ConversationCreatedEvent) => void,
): void => {
  appEventBus.on(CHAT_EVENT_NAMES.CONVERSATION_CREATED, listener);
};

export const emitConversationSeen = (event: ConversationSeenEvent): void => {
  appEventBus.emit(CHAT_EVENT_NAMES.CONVERSATION_SEEN, event);
};

export const onConversationSeen = (listener: (event: ConversationSeenEvent) => void): void => {
  appEventBus.on(CHAT_EVENT_NAMES.CONVERSATION_SEEN, listener);
};
