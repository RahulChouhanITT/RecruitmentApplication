import {
  FiEdit2,
  FiMessageCircle,
  FiMoreHorizontal,
  FiSearch,
  FiSend,
  FiUser,
} from 'react-icons/fi';
import { MdDone, MdDoneAll } from 'react-icons/md';
import { EmptyStateCard } from '../../../dashboard/components/EmptyStateCard';
import type { ChatMessage as ChatMessageEntity } from '../../../../types/chatTypes';
import { useChatController } from '../../hooks/useChatController';
import { CHAT_UI_LABELS } from '../../labels/chatLabels';
import { getConversationListItemView, getMessageView } from '../../selectors/chatPresentationSelectors';
import type { ChatThreadsPanelProps } from '../../types/chatUiTypes';
import { getChatAvatarText } from '../../utils/chatCacheHelpers';
import {
  Avatar,
  ChatItem,
  ChatItemContent,
  ChatItemMetaRow,
  ChatLayout,
  ChatList,
  ChatListPanel,
  ChatMessage,
  ChatMeta,
  ChatPanelHeader,
  ChatTitle,
  Composer,
  ComposerBox,
  ComposerButton,
  ComposerErrorText,
  ComposerInput,
  EmptyStateWrap,
  FilterPill,
  FilterRow,
  HeaderActions,
  HeaderAvatar,
  HeaderIconButton,
  HeaderTabs,
  HeaderTitle,
  HeaderTitleRow,
  HeaderUserInfo,
  InlineActionButton,
  ListStateCard,
  MessageAuthor,
  MessageBubble,
  MessageDateDivider,
  MessageHeader,
  MessageList,
  MessagePane,
  MessageStack,
  MessageStateCard,
  MessageText,
  MessageTime,
  StartChatButton,
  TypingAvatar,
  TypingBubble,
  TypingDot,
  TypingIndicatorRow,
  UnreadBadge,
} from './ChatThreadsPanel.styles';

const renderMessageStatusTick = (status: ChatMessageEntity['status']) => {
  if (status === 'SENT') {
    return <MdDone size={13} className="status-icon" />;
  }

  if (status === 'SEEN') {
    return <MdDoneAll size={13} className="status-icon status-seen" />;
  }

  return <MdDoneAll size={13} className="status-icon" />;
};

export const ChatThreadsPanel = ({
  hideConversationList = false,
  forcedConversationId,
}: ChatThreadsPanelProps) => {
  const {
    currentUser,
    currentUserId,
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
    activeConversationId,
    shouldShowConversationList,
    shouldShowMessagePane,
    onConversationSelect,
    onSendMessage,
    onComposerKeyDown,
    onRetryConversations,
    onRetryMessages,
    onRetrySend,
    onClearSendError,
  } = useChatController({ hideConversationList, forcedConversationId });

  if (isLoadingConversations && conversations.length === 0) {
    return (
      <EmptyStateWrap>
        <EmptyStateCard
          icon={FiMessageCircle}
          title={CHAT_UI_LABELS.PANEL_TITLE}
          description={CHAT_UI_LABELS.LOADING_CHATS}
        />
      </EmptyStateWrap>
    );
  }

  if (hasConversationsError && conversations.length === 0) {
    return (
      <EmptyStateWrap>
        <EmptyStateCard
          icon={FiMessageCircle}
          title={CHAT_UI_LABELS.EMPTY_TITLE}
          description={errorMessage || CHAT_UI_LABELS.CHAT_LOAD_ERROR}
        />
        <StartChatButton type="button" onClick={onRetryConversations}>
          {CHAT_UI_LABELS.RETRY}
        </StartChatButton>
      </EmptyStateWrap>
    );
  }

  if (conversations.length === 0) {
    return (
      <EmptyStateWrap>
        <EmptyStateCard
          icon={FiMessageCircle}
          title={CHAT_UI_LABELS.EMPTY_TITLE}
          description={errorMessage || CHAT_UI_LABELS.EMPTY_DESCRIPTION}
        />
        {currentUser?.role === 'candidate' ? (
          <StartChatButton type="button" onClick={onStartCandidateChat} disabled={isStartingChat}>
            {isStartingChat ? CHAT_UI_LABELS.STARTING_CHAT : CHAT_UI_LABELS.START_CHAT}
          </StartChatButton>
        ) : null}
      </EmptyStateWrap>
    );
  }

  return (
    <ChatLayout $singlePane={hideConversationList}>
      {shouldShowConversationList ? (
        <ChatListPanel $singlePane={hideConversationList}>
          <ChatPanelHeader>
            <h3>{CHAT_UI_LABELS.PANEL_TITLE}</h3>
            <HeaderActions>
              <HeaderIconButton type="button" aria-label={CHAT_UI_LABELS.HEADER_MORE}>
                <FiMoreHorizontal size={16} />
              </HeaderIconButton>
              <HeaderIconButton type="button" aria-label={CHAT_UI_LABELS.HEADER_SEARCH}>
                <FiSearch size={15} />
              </HeaderIconButton>
              <HeaderIconButton type="button" aria-label={CHAT_UI_LABELS.HEADER_NEW_CHAT}>
                <FiEdit2 size={15} />
              </HeaderIconButton>
            </HeaderActions>
          </ChatPanelHeader>

          <FilterRow>
            <FilterPill>{CHAT_UI_LABELS.FILTER_UNREAD}</FilterPill>
            <FilterPill>{CHAT_UI_LABELS.FILTER_CHANNELS}</FilterPill>
            <FilterPill>{CHAT_UI_LABELS.FILTER_CHATS}</FilterPill>
          </FilterRow>

          <ChatList>
            {isFetchingConversations ? (
              <ListStateCard>{CHAT_UI_LABELS.LOADING_CHATS}</ListStateCard>
            ) : null}
            {conversations.map((conversation) => {
              const conversationView = getConversationListItemView(conversation, currentUserId);

              return (
                <ChatItem
                  key={conversation._id}
                  $isActive={conversation._id === activeConversationId}
                  onClick={() => onConversationSelect(conversation._id)}
                >
                  <Avatar>{conversationView.avatarText || <FiUser size={14} />}</Avatar>
                  <ChatItemContent>
                    <ChatItemMetaRow>
                      <ChatTitle>{conversationView.title}</ChatTitle>
                      {conversationView.lastMessageTime ? (
                        <ChatMeta>{conversationView.lastMessageTime}</ChatMeta>
                      ) : null}
                    </ChatItemMetaRow>
                    <ChatMeta>{conversationView.subtitle}</ChatMeta>
                    <ChatMessage>{conversationView.lastMessage}</ChatMessage>
                  </ChatItemContent>
                  {conversationView.unreadCount > 0 ? (
                    <UnreadBadge>{conversationView.unreadCount}</UnreadBadge>
                  ) : null}
                </ChatItem>
              );
            })}
          </ChatList>
        </ChatListPanel>
      ) : null}

      {shouldShowMessagePane ? (
        <MessagePane>
          <MessageHeader>
            <HeaderTitleRow>
              <HeaderUserInfo>
                <HeaderAvatar>{getChatAvatarText(activeTitle) || <FiUser size={16} />}</HeaderAvatar>
                <HeaderTitle>{activeTitle}</HeaderTitle>
                <HeaderTabs>
                  <span className="tab active">Chat</span>
                </HeaderTabs>
              </HeaderUserInfo>
              <span
                className={
                  activePresence === 'online' ? 'presence active online' : 'presence active offline'
                }
              >
                {activePresence === 'online' ? CHAT_UI_LABELS.ONLINE : CHAT_UI_LABELS.OFFLINE}
              </span>
            </HeaderTitleRow>
          </MessageHeader>

          <MessageList ref={messageListRef}>
            {isLoadingMessages || isFetchingMessages ? (
              <MessageStateCard>{CHAT_UI_LABELS.LOADING_MESSAGES}</MessageStateCard>
            ) : null}
            {hasMessagesError ? (
              <MessageStateCard>
                <span>{errorMessage || CHAT_UI_LABELS.MESSAGE_LOAD_ERROR}</span>
                <InlineActionButton type="button" onClick={onRetryMessages}>
                  {CHAT_UI_LABELS.RETRY}
                </InlineActionButton>
              </MessageStateCard>
            ) : null}
            {messageItems.map((item) => {
              if (item.type === 'date') {
                return <MessageDateDivider key={item.key}>{item.label}</MessageDateDivider>;
              }

              const messageView = getMessageView(item.message, currentUserId);
              return (
                <MessageStack key={item.key} $isMine={messageView.isMine}>
                  {!messageView.isMine ? (
                    <MessageAuthor>
                      {messageView.authorName}
                      <span>{messageView.sentAtLabel}</span>
                    </MessageAuthor>
                  ) : null}
                  <MessageBubble $isMine={messageView.isMine}>
                    <MessageText>{item.message.message || ''}</MessageText>
                    <MessageTime>
                      {messageView.sentAtLabel}
                      {messageView.isMine
                        ? renderMessageStatusTick(item.message.status ?? 'DELIVERED')
                        : null}
                    </MessageTime>
                  </MessageBubble>
                </MessageStack>
              );
            })}
            {isSomeoneTyping ? (
              <TypingIndicatorRow>
                <TypingAvatar>{getChatAvatarText(typingParticipantName || activeTitle)}</TypingAvatar>
                <TypingBubble aria-label={`${typingParticipantName || activeTitle} is typing`}>
                  <TypingDot />
                  <TypingDot />
                  <TypingDot />
                </TypingBubble>
              </TypingIndicatorRow>
            ) : null}
          </MessageList>

          <Composer onSubmit={onSendMessage}>
            <ComposerBox>
              <ComposerInput
                value={draft}
                onChange={(event) => {
                  if (sendErrorMessage) {
                    onClearSendError();
                  }
                  setDraft(event.target.value);
                }}
                onKeyDown={onComposerKeyDown}
                placeholder={CHAT_UI_LABELS.COMPOSER_PLACEHOLDER}
                rows={1}
              />
              <ComposerButton
                type="submit"
                disabled={!draft.trim() || isSending}
                aria-label={CHAT_UI_LABELS.SEND}
              >
                <FiSend size={16} />
              </ComposerButton>
            </ComposerBox>
          </Composer>
          {sendErrorMessage ? (
            <ComposerErrorText>
              <span>{sendErrorMessage}</span>
              <InlineActionButton type="button" onClick={onRetrySend}>
                {CHAT_UI_LABELS.SEND_RETRY}
              </InlineActionButton>
            </ComposerErrorText>
          ) : null}
        </MessagePane>
      ) : null}
    </ChatLayout>
  );
};
