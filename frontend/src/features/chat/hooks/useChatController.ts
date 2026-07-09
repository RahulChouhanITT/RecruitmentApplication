import { useMemo, useRef, useState } from 'react';
import { useAppSelector } from '../../../app/hooks';
import { useSocket } from '../../../app/socket/useSocket';
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useStartCandidateHrConversationMutation,
} from '../api/chatApi';
import { getChatErrorMessage } from '../handlers/chatErrorHandler';
import { getActiveConversationView } from '../selectors/chatSelectors';
import type { ChatMessageItem, ChatThreadsPanelProps } from '../types/chatUiTypes';
import {
  buildChatMessageItems,
  sendChatMessage,
  startCandidateHrConversation as startCandidateHrConversationFlow,
} from '../usecases';
import { canSubmitChatDraft } from '../validations/chatValidation';
import { useChatScroll } from './useChatScroll';
import { useChatTypingIndicator } from './useChatTypingIndicator';

export const useChatController = ({
  hideConversationList = false,
  forcedConversationId,
}: ChatThreadsPanelProps) => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const currentUserId = currentUser?._id ?? '';
  const { socket } = useSocket();

  const [selectedConversationId, setSelectedConversationId] = useState('');
  const [isConversationPickerOpen, setIsConversationPickerOpen] = useState(
    () => !hideConversationList,
  );
  const [draft, setDraft] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [sendErrorMessage, setSendErrorMessage] = useState('');
  const messageListRef = useRef<HTMLDivElement | null>(null);

  const {
    data: conversationsResponse,
    isLoading: isLoadingConversations,
    isFetching: isFetchingConversations,
    isError: hasConversationsError,
    refetch: refetchConversations,
  } = useGetConversationsQuery();
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [triggerStartCandidateHrConversation, { isLoading: isStartingChat }] =
    useStartCandidateHrConversationMutation();

  const conversations = useMemo(
    () => conversationsResponse?.data ?? [],
    [conversationsResponse?.data],
  );

  const activeConversationId =
    forcedConversationId || selectedConversationId || conversations[0]?._id || '';
  const activeConversationUnreadCount = useMemo(
    () =>
      conversations.find((conversation) => conversation._id === activeConversationId)?.unreadCount ?? 0,
    [activeConversationId, conversations],
  );
  const shouldShowConversationPicker = hideConversationList
    ? !forcedConversationId && isConversationPickerOpen
    : true;

  const {
    data: messagesResponse,
    isLoading: isLoadingMessages,
    isFetching: isFetchingMessages,
    isError: hasMessagesError,
    refetch: refetchMessages,
  } = useGetMessagesQuery({ conversationId: activeConversationId }, { skip: !activeConversationId });
  const messages = useMemo(() => messagesResponse?.data ?? [], [messagesResponse?.data]);
  const messageItems = useMemo<ChatMessageItem[]>(() => buildChatMessageItems(messages), [messages]);

  useChatScroll({
    messageListRef,
    activeConversationId,
    messageCount: messages.length,
  });

  const { activeTitle, activePresence } = useMemo(
    () => getActiveConversationView(conversations, activeConversationId, currentUserId),
    [activeConversationId, conversations, currentUserId],
  );

  const shouldShowConversationList = shouldShowConversationPicker;
  const shouldShowMessagePane =
    (!hideConversationList || !shouldShowConversationPicker) && Boolean(activeConversationId);
  const { typingParticipantName, isSomeoneTyping } = useChatTypingIndicator({
    socket,
    activeConversationId,
    currentUserId,
    currentUserName: currentUser?.name,
    draft,
  });

  const onConversationSelect = (conversationId: string): void => {
    setSelectedConversationId(conversationId);
    setErrorMessage('');
    setSendErrorMessage('');

    if (hideConversationList) {
      setIsConversationPickerOpen(false);
    }
  };

  const onStartCandidateChat = async (): Promise<void> => {
    setErrorMessage('');

    try {
      const conversationId = await startCandidateHrConversationFlow(
        triggerStartCandidateHrConversation,
      );

      if (conversationId) {
        setSelectedConversationId(conversationId);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : getChatErrorMessage(error, 'Unable to start a conversation right now.'),
      );
    }
  };

  const submitMessage = async (): Promise<void> => {
    setSendErrorMessage('');

    try {
      const didSend = await sendChatMessage({
        activeConversationId,
        draft,
        sendMessage,
      });

      if (!didSend) {
        return;
      }

      setDraft('');
    } catch (error) {
      setSendErrorMessage(
        error instanceof Error
          ? error.message
          : getChatErrorMessage(error, 'Unable to send message. Please try again.'),
      );
    }
  };

  const onSendMessage = async (event?: React.FormEvent): Promise<void> => {
    event?.preventDefault();
    await submitMessage();
  };

  const onComposerKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      if (!canSubmitChatDraft(activeConversationId, draft.trim()) || isSending) {
        return;
      }

      void submitMessage();
    }
  };

  const onRetryConversations = (): void => {
    setErrorMessage('');
    void refetchConversations();
  };

  const onRetryMessages = (): void => {
    setErrorMessage('');
    void refetchMessages();
  };

  const onRetrySend = (): void => {
    void submitMessage();
  };

  const onClearSendError = (): void => {
    setSendErrorMessage('');
  };

  return {
    currentUser,
    currentUserId,
    activeConversationId,
    activeConversationUnreadCount,
    draft,
    setDraft,
    messageListRef,
    conversations,
    messageItems,
    errorMessage,
    sendErrorMessage,
    isLoadingConversations,
    isFetchingConversations,
    hasConversationsError,
    isLoadingMessages,
    isFetchingMessages,
    hasMessagesError,
    isSending,
    isStartingChat,
    onStartCandidateChat,
    activeTitle,
    activePresence,
    typingParticipantName,
    isSomeoneTyping,
    shouldShowConversationList,
    shouldShowMessagePane,
    onConversationSelect,
    onSendMessage,
    onComposerKeyDown,
    onRetryConversations,
    onRetryMessages,
    onRetrySend,
    onClearSendError,
    setErrorMessage,
  };
};
