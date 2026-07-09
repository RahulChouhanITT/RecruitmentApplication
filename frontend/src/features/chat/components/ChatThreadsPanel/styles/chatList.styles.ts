import styled from 'styled-components';

export const ChatListPanel = styled.div<{ $singlePane?: boolean }>`
  background: var(--chat-sidebar);
  border-right: ${({ $singlePane }) => ($singlePane ? 'none' : '1px solid var(--chat-border)')};
  display: grid;
  grid-template-rows: auto auto 1fr;
  min-height: 0;

  @media (max-width: 980px) {
    border-right: none;
    border-bottom: ${({ $singlePane }) => ($singlePane ? 'none' : '1px solid var(--chat-border)')};
    max-height: 42dvh;
  }
`;

export const ChatPanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing.lg} ${theme.spacing.lg} ${theme.spacing.md}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: var(--chat-sidebar);

  h3 {
    margin: 0;
    font-size: 1.35rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

export const HeaderIconButton = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: ${({ theme }) => theme.radius.sm};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.hoverBg};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const FilterRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 0 ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
`;

export const FilterPill = styled.span`
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.colors.textTertiary};
  font-size: 0.73rem;
  line-height: 1;
  padding: 0.42rem 0.66rem;
  background: ${({ theme }) => theme.colors.white};
`;

export const ChatList = styled.div`
  overflow-y: auto;
  padding: 0.25rem 0.65rem 0.85rem;
  display: grid;
  gap: 0.32rem;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
`;

export const ChatItem = styled.button<{ $isActive?: boolean }>`
  width: 100%;
  border: 1px solid
    ${({ $isActive, theme }) => ($isActive ? theme.colors.primaryBorder : 'transparent')};
  background: ${({ $isActive, theme }) => ($isActive ? theme.colors.white : 'transparent')};
  border-radius: ${({ theme }) => theme.radius.sm};
  padding: 0.52rem 0.64rem;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  gap: 0.62rem;
  text-align: left;
  cursor: pointer;
  box-shadow: ${({ $isActive, theme }) => ($isActive ? theme.shadows.card : 'none')};
  transition:
    background-color 140ms ease,
    transform 140ms ease,
    border-color 140ms ease,
    box-shadow 140ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.white};
    border-color: ${({ theme }) => theme.colors.borderStrong};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.card};
  }
`;

export const Avatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: linear-gradient(180deg, #eef3fb 0%, #dbe6f7 100%);
  color: ${({ theme }) => theme.colors.textSecondary};
  display: grid;
  place-items: center;
  font-size: 0.83rem;
  font-weight: 700;
`;

export const ChatItemContent = styled.div`
  min-width: 0;
`;

export const ChatItemMetaRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
`;

export const ChatTitle = styled.strong`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 0.87rem;
  display: block;
  font-weight: 600;
`;

export const ChatMeta = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.72rem;
  white-space: nowrap;
`;

export const ChatMessage = styled.p`
  margin: 0.08rem 0 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.78rem;
  line-height: 1.34;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ListStateCard = styled.div`
  margin: 0.25rem 0.65rem 0.85rem;
  padding: 0.9rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: grid;
  gap: 0.6rem;
`;

export const InlineActionButton = styled.button`
  justify-self: start;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: 0.38rem 0.8rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryBorder};
  }
`;

export const UnreadBadge = styled.span`
  align-self: center;
  min-width: 18px;
  height: 18px;
  padding: 0 0.3rem;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.66rem;
  line-height: 18px;
  text-align: center;
  font-weight: 700;
`;
