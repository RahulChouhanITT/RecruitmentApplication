import styled from 'styled-components';

export const LeftPanel = styled.aside<{
  $isOpen?: boolean;
  $isCollapsed?: boolean;
  $isResizing?: boolean;
}>`
  border-right: 1px solid #e5e7eb;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '100%')};
  overflow: hidden;
  opacity: ${({ $isCollapsed }) => ($isCollapsed ? 0 : 1)};
  pointer-events: ${({ $isCollapsed }) => ($isCollapsed ? 'none' : 'auto')};
  transition:
    ${({ $isResizing }) => ($isResizing ? 'none' : 'width 0.24s ease, opacity 0.18s ease')};

  @media (max-width: 820px) {
    position: absolute;
    top: 0;
    left: 72px;
    bottom: 0;
    width: min(76vw, 300px);
    z-index: 3200;
    transform: ${({ $isOpen }) => ($isOpen ? 'translateX(0)' : 'translateX(-105%)')};
    transition: transform 0.22s ease;
    box-shadow: 0 16px 34px rgba(16, 28, 48, 0.22);
  }

  @media (max-width: 640px) {
    left: 68px;
    width: min(78vw, 280px);
  }
`;

export const LeftPanelHeader = styled.div`
  min-height: 64px;
  padding: 0.9rem 1rem 0.85rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const IdentityTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
`;

export const IdentitySubtitle = styled.p`
  margin: 0.12rem 0 0;
  color: var(--muted);
  font-size: 0.8rem;
`;

export const LeftPanelSearch = styled.label`
  margin: 0.9rem 0.9rem 0.6rem;
  padding: 0.45rem 0.65rem;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid var(--border);
  border-radius: 0.65rem;
  background: #ffffff;
  color: #6b7280;

  input {
    border: 0;
    outline: none;
    background: transparent;
    width: 100%;
    color: #111827;
    font-size: 0.82rem;
  }
`;

export const LeftPanelList = styled.div<{ $singleItem?: boolean }>`
  padding: ${({ $singleItem }) => ($singleItem ? '0.85rem 0.6rem 1rem' : '0.35rem 0.6rem 1rem')};
  overflow-y: auto;
  scrollbar-gutter: stable;
  display: grid;
  gap: ${({ $singleItem }) => ($singleItem ? '0.5rem' : '0.35rem')};
`;

export const LeftPanelItem = styled.button<{ $isActive: boolean; $hasUnread?: boolean }>`
  position: relative;
  border: 1px solid
    ${({ $isActive, $hasUnread }) =>
      $isActive ? '#d1d5db' : $hasUnread ? 'rgba(255, 106, 0, 0.35)' : 'transparent'};
  background: ${({ $isActive, $hasUnread }) =>
    $isActive ? '#f3f4f6' : $hasUnread ? 'rgba(255, 106, 0, 0.08)' : 'transparent'};
  color: #111827;
  border-radius: 0.75rem;
  text-align: left;
  padding: 0.65rem 0.6rem;
  cursor: pointer;
  display: grid;
  gap: 0.2rem;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    transform 0.16s ease;
  width: 100%;

  &:hover {
    background: ${({ $isActive }) => ($isActive ? '#f3f4f6' : '#f9fafb')};
    transform: translateY(-1px);
    z-index: 1;
  }
`;

export const LeftPanelItemRow = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.45rem;
`;

export const LeftPanelItemAvatar = styled.span`
  width: 1.7rem;
  height: 1.7rem;
  border-radius: 999px;
  background: #e5e7eb;
  color: #111827;
  font-size: 0.7rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const LeftPanelItemMeta = styled.div`
  min-width: 0;
  display: grid;
  gap: 0.1rem;

  strong {
    font-size: 0.82rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    font-size: 0.74rem;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const LeftPanelItemStatus = styled.span<{ $online: boolean }>`
  font-size: 0.67rem;
  color: ${({ $online }) => ($online ? '#059669' : '#6b7280')};
  font-weight: 600;
`;

export const LeftPanelItemRight = styled.div`
  justify-self: end;
  display: grid;
  justify-items: end;
  gap: 0.22rem;
`;

export const LeftPanelItemUnreadBadge = styled.span`
  min-width: 1.15rem;
  height: 1.05rem;
  border-radius: 999px;
  padding: 0 0.3rem;
  background: #ff6a00;
  color: #ffffff;
  font-size: 0.6rem;
  line-height: 1.05rem;
  text-align: center;
  font-weight: 700;
`;
