import styled from 'styled-components';
import { chatPanelHeight } from './chatShared.styles';

const typingPulse = `
  @keyframes chatTypingPulse {
    0%, 80%, 100% {
      transform: translateY(0);
      opacity: 0.35;
    }
    40% {
      transform: translateY(-2px);
      opacity: 1;
    }
  }
`;

export const MessagePane = styled.div`
  background: var(--chat-main);
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 0;
  max-height: ${chatPanelHeight};
  overflow: hidden;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
`;

export const MessageHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 3;
  padding: 1rem 1.25rem 0.85rem;
  border-bottom: 1px solid var(--chat-border);
  background: ${({ theme }) => theme.colors.white};
`;

export const HeaderTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;

  > .presence {
    flex-shrink: 0;
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.82rem;
    font-weight: 600;
  }

  > .presence.online {
    color: ${({ theme }) => theme.colors.success};
  }

  > .presence.offline {
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  @media (max-width: 820px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const HeaderUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
  flex-wrap: wrap;
`;

export const HeaderAvatar = styled.span`
  width: 2rem;
  height: 2rem;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: linear-gradient(180deg, #eff4fd 0%, #dce7f8 100%);
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.8rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const HeaderTitle = styled.strong`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 1.05rem;
  font-weight: 700;
`;

export const HeaderTabs = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;

  span {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.82rem;
    padding-bottom: 0;
    border-bottom: none;
    text-decoration: none;
  }

  span.tab {
    position: relative;
    padding: 0.25rem 0;
  }

  span.tab.active {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: 600;
  }

  span.tab.active::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -0.35rem;
    height: 2px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.inputFocus};
  }

  span.active.online {
    color: ${({ theme }) => theme.colors.success};
    border-bottom: none;
  }

  span.active.offline {
    color: ${({ theme }) => theme.colors.textPrimary};
    border-bottom: none;
  }
`;

export const MessageList = styled.div`
  padding: 1.25rem 1.35rem;
  display: grid;
  gap: 0.95rem;
  overflow-y: auto;
  min-height: 0;
  align-content: start;
  background:
    radial-gradient(circle at top, rgba(235, 243, 255, 0.45), transparent 32%),
    ${({ theme }) => theme.colors.white};
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
`;

export const MessageDateDivider = styled.div`
  justify-self: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.28rem 0.72rem;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1;
  box-shadow: ${({ theme }) => theme.shadows.floating};
`;

export const MessageBubble = styled.article<{ $isMine: boolean }>`
  position: relative;
  width: fit-content;
  max-width: min(100%, 560px);
  justify-self: ${({ $isMine }) => ($isMine ? 'end' : 'start')};
  background: ${({ $isMine, theme }) =>
    $isMine ? theme.colors.infoBackground : theme.colors.white};
  border: 1px solid
    ${({ $isMine, theme }) => ($isMine ? theme.colors.infoBorder : theme.colors.borderMuted)};
  color: ${({ theme }) => theme.colors.textPrimary};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 0.55rem 0.85rem 0.35rem;
  display: grid;
  gap: 0.35rem;
  box-shadow: ${({ theme }) => theme.shadows.card};
  transition: transform 120ms ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

export const MessageStack = styled.div<{ $isMine: boolean }>`
  justify-self: ${({ $isMine }) => ($isMine ? 'end' : 'start')};
  display: grid;
  gap: 0.22rem;
  max-width: min(82%, 560px);

  @media (max-width: 680px) {
    max-width: 92%;
  }
`;

export const MessageAuthor = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: ${({ theme }) => theme.colors.textTertiary};
  font-size: 0.76rem;
  padding-left: 0.1rem;

  span {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export const MessageText = styled.p`
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.44;
  white-space: pre-wrap;
  word-break: break-word;
  padding-right: 68px;
  padding-bottom: 6px;
`;

export const MessageTime = styled.span`
  position: absolute;
  right: 9px;
  bottom: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.24rem;
  font-size: 0.68rem;
  line-height: 1;
  color: ${({ theme }) => theme.colors.textMuted};

  .status-icon {
    margin-top: 1px;
  }

  .status-seen {
    color: ${({ theme }) => theme.colors.inputFocus};
  }
`;

export const MessageStateCard = styled.div`
  justify-self: center;
  width: min(100%, 420px);
  padding: 0.95rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: grid;
  gap: 0.65rem;
  text-align: center;
`;

export const ComposerErrorText = styled.div`
  padding: 0 1.35rem 0.85rem;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
`;

export const TypingIndicatorRow = styled.div`
  ${typingPulse}
  justify-self: start;
  display: inline-flex;
  align-items: flex-end;
  gap: 0.48rem;
  padding-left: 0.1rem;
`;

export const TypingAvatar = styled.span`
  width: 1.9rem;
  height: 1.9rem;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: linear-gradient(180deg, #eff4fd 0%, #dce7f8 100%);
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.72rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const TypingBubble = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.22rem;
  min-height: 2rem;
  padding: 0.5rem 0.72rem;
  border-radius: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.borderMuted};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

export const TypingDot = styled.span`
  width: 0.36rem;
  height: 0.36rem;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.colors.textMuted};
  animation: chatTypingPulse 1.15s infinite ease-in-out;

  &:nth-child(2) {
    animation-delay: 0.16s;
  }

  &:nth-child(3) {
    animation-delay: 0.32s;
  }
`;
