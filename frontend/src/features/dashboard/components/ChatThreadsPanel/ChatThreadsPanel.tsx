import {
  FiEdit2,
  FiMessageCircle,
  FiMoreHorizontal,
  FiSearch,
  FiSend,
  FiUser,
} from "react-icons/fi";
import { MdDone, MdDoneAll } from "react-icons/md";
import { EmptyStateCard } from "../EmptyStateCard/EmptyStateCard";
import { useChatThreadsPanel } from "../../hooks/useChatThreadsPanel";
import type { ChatThreadsPanelProps } from "../../types/dashboardTypes";
import { DASHBOARD_CHAT_LABELS } from "../../labels/dashboardLabels";
import {
  Avatar,
  ChatItem,
  ChatItemContent,
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
  ComposerInput,
  FilterPill,
  FilterRow,
  HeaderActions,
  HeaderAvatar,
  HeaderIconButton,
  HeaderTabs,
  HeaderTitle,
  HeaderTitleRow,
  HeaderUserInfo,
  MessageBubble,
  MessageDateDivider,
  MessageHeader,
  MessageList,
  MessagePane,
  MessageText,
  MessageTime,
  StartChatButton,
  UnreadBadge,
} from "./ChatThreadsPanel.styles";
import { formatConversationTime } from "../../utils/chatThreadHelpers";

const renderMessageStatusTick = (status: "SENT" | "DELIVERED" | "SEEN") => {
  if (status === "SENT") {
    return <MdDone size={13} className="status-icon" />;
  }

  if (status === "SEEN") {
    return <MdDoneAll size={13} className="status-icon status-seen" />;
  }

  return <MdDoneAll size={13} className="status-icon" />;
};

export const ChatThreadsPanel = ({ hideConversationList = false, forcedConversationId }: ChatThreadsPanelProps) => {
  const {
    currentUser,
    currentUserId,
    activeConversationId,
    draft,
    setDraft,
    messageListRef,
    conversations,
    messageItems,
    isSending,
    isStartingChat,
    onStartCandidateChat,
    activeTitle,
    activePresence,
    shouldShowConversationList,
    shouldShowMessagePane,
    onConversationSelect,
    onSendMessage,
    onComposerKeyDown,
  } = useChatThreadsPanel({ hideConversationList, forcedConversationId });

  if (conversations.length === 0) {
    return (
      <>
        <EmptyStateCard
          icon={FiMessageCircle}
          title={DASHBOARD_CHAT_LABELS.EMPTY_TITLE}
          description={DASHBOARD_CHAT_LABELS.EMPTY_DESCRIPTION}
        />
        {currentUser?.role === "candidate" ? (
          <StartChatButton type="button" onClick={onStartCandidateChat} disabled={isStartingChat}>
            {isStartingChat ? DASHBOARD_CHAT_LABELS.STARTING_CHAT : DASHBOARD_CHAT_LABELS.START_CHAT}
          </StartChatButton>
        ) : null}
      </>
    );
  }

  return (
    <ChatLayout $singlePane={hideConversationList}>
      {shouldShowConversationList ? (
        <ChatListPanel $singlePane={hideConversationList}>
          <ChatPanelHeader>
            <h3>{DASHBOARD_CHAT_LABELS.PANEL_TITLE}</h3>
            <HeaderActions>
              <HeaderIconButton type="button" title={DASHBOARD_CHAT_LABELS.HEADER_MORE}>
                <FiMoreHorizontal size={16} />
              </HeaderIconButton>
              <HeaderIconButton type="button" title={DASHBOARD_CHAT_LABELS.HEADER_SEARCH}>
                <FiSearch size={15} />
              </HeaderIconButton>
              <HeaderIconButton type="button" title={DASHBOARD_CHAT_LABELS.HEADER_NEW_CHAT}>
                <FiEdit2 size={15} />
              </HeaderIconButton>
            </HeaderActions>
          </ChatPanelHeader>

          <FilterRow>
            <FilterPill>{DASHBOARD_CHAT_LABELS.FILTER_UNREAD}</FilterPill>
            <FilterPill>{DASHBOARD_CHAT_LABELS.FILTER_CHANNELS}</FilterPill>
            <FilterPill>{DASHBOARD_CHAT_LABELS.FILTER_CHATS}</FilterPill>
          </FilterRow>

          <ChatList>
            {conversations.map((conversation) => {
              const counterpart = conversation.participants.find((participant) => participant._id !== currentUserId);
              const title = counterpart ? counterpart.name : DASHBOARD_CHAT_LABELS.DEFAULT_TITLE;
              const subtitle = counterpart ? counterpart.role : "";

              return (
                <ChatItem
                  key={conversation._id}
                  $isActive={conversation._id === activeConversationId}
                  onClick={() => onConversationSelect(conversation._id)}
                >
                  <Avatar>
                    <FiUser size={14} />
                  </Avatar>
                  <ChatItemContent>
                    <ChatTitle>{title}</ChatTitle>
                    <ChatMeta>
                      {subtitle} {conversation.lastMessageAt ? `- ${formatConversationTime(conversation.lastMessageAt)}` : ""}
                    </ChatMeta>
                    <ChatMessage>{conversation.lastMessage || DASHBOARD_CHAT_LABELS.DEFAULT_LAST_MESSAGE}</ChatMessage>
                  </ChatItemContent>
                  {conversation.unreadCount > 0 ? <UnreadBadge>{conversation.unreadCount}</UnreadBadge> : null}
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
              <HeaderAvatar>
                <FiUser size={16} />
              </HeaderAvatar>
              <HeaderTitle>{activeTitle}</HeaderTitle>
            </HeaderUserInfo>
          </HeaderTitleRow>
          <HeaderTabs>
            <span className={activePresence === "online" ? "active online" : "active offline"}>
              {activePresence === "online" ? DASHBOARD_CHAT_LABELS.ONLINE : DASHBOARD_CHAT_LABELS.OFFLINE}
            </span>
          </HeaderTabs>
        </MessageHeader>

        <MessageList ref={messageListRef}>
          {messageItems.map((item) => {
            if (item.type === "date") {
              return <MessageDateDivider key={item.key}>{item.label}</MessageDateDivider>;
            }

            const isMine = item.message.sender._id === currentUserId;
            return (
              <MessageBubble key={item.key} $isMine={isMine}>
                <MessageText>{item.message.message}</MessageText>
                <MessageTime>
                  {new Date(item.message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {isMine ? renderMessageStatusTick(item.message.status) : null}
                </MessageTime>
              </MessageBubble>
            );
          })}
        </MessageList>

        <Composer onSubmit={onSendMessage}>
          <ComposerBox>
            <ComposerInput
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onComposerKeyDown}
              placeholder={DASHBOARD_CHAT_LABELS.COMPOSER_PLACEHOLDER}
              rows={1}
            />
            <div>
              <ComposerButton type="submit" disabled={!draft.trim() || isSending} title={DASHBOARD_CHAT_LABELS.SEND}>
                <FiSend size={16} />
              </ComposerButton>
            </div>
          </ComposerBox>
        </Composer>
      </MessagePane>
      ) : null}
    </ChatLayout>
  );
};
