import styled from 'styled-components';
import { chatPanelHeight, panelMotion } from './styles/chatShared.styles';

export const ChatLayout = styled.section<{ $singlePane?: boolean }>`
  ${panelMotion}
  --chat-border: ${({ theme }) => theme.colors.borderMuted};
  --chat-sidebar: ${({ theme }) => theme.colors.panelBg};
  --chat-main: ${({ theme }) => theme.colors.white};
  display: grid;
  grid-template-columns: ${({ $singlePane }) =>
    $singlePane ? 'minmax(0, 1fr)' : '330px minmax(0, 1fr)'};
  gap: 0;
  min-height: ${chatPanelHeight};
  height: ${chatPanelHeight};
  border: none;
  border-radius: 0;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.white};
  animation: fadeUpChatPanel 220ms ease both;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    min-height: calc(100dvh - 72px);
    height: calc(100dvh - 72px);
  }
`;

export {
  Avatar,
  ChatItem,
  ChatItemContent,
  ChatItemMetaRow,
  ChatList,
  ChatListPanel,
  ChatMessage,
  ChatMeta,
  ChatPanelHeader,
  ChatTitle,
  FilterPill,
  FilterRow,
  HeaderActions,
  HeaderIconButton,
  InlineActionButton,
  ListStateCard,
  UnreadBadge,
} from './styles/chatList.styles';

export {
  Composer,
  ComposerBox,
  ComposerButton,
  ComposerInput,
} from './styles/chatComposer.styles';

export {
  EmptyStateWrap,
  StartChatButton,
} from './styles/chatEmptyState.styles';

export {
  HeaderAvatar,
  HeaderTabs,
  HeaderTitle,
  HeaderTitleRow,
  HeaderUserInfo,
  MessageAuthor,
  MessageBubble,
  MessageDateDivider,
  MessageHeader,
  MessageList,
  MessagePane,
  MessageStateCard,
  MessageStack,
  MessageText,
  MessageTime,
  ComposerErrorText,
  TypingAvatar,
  TypingBubble,
  TypingDot,
  TypingIndicatorRow,
} from './styles/chatMessagePane.styles';
