import styled from "styled-components";

export const ShellRoot = styled.main`
  width: 100%;
  height: 100dvh;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  background: linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%);
  overflow: hidden;
`;

export const PageLayout = styled.section<{ $leftPanelWidth?: number; $isLeftPanelCollapsed?: boolean }>`
  --rail-bg: #fafafa;
  --panel-bg: #f8f8f8;
  --surface: #ffffff;
  --border: #e5e7eb;
  --text: #111827;
  --muted: #6b7280;
  --accent: #111111;

  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 72px
    ${({ $leftPanelWidth, $isLeftPanelCollapsed }) => ($isLeftPanelCollapsed ? "0px" : `${$leftPanelWidth ?? 320}px`)}
    minmax(0, 1fr);
  color: var(--text);
  min-height: 0;
  position: relative;
  transition: grid-template-columns 0.24s ease;

  @media (max-width: 1024px) {
    grid-template-columns: 60px 260px minmax(0, 1fr);
  }

  @media (max-width: 820px) {
    grid-template-columns: 72px minmax(0, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 68px minmax(0, 1fr);
  }
`;

export const SidebarShell = styled.aside<{ $leftPanelWidth?: number; $isOpen?: boolean }>`
  display: grid;
  grid-template-columns: 72px ${({ $leftPanelWidth }) => `${$leftPanelWidth ?? 320}px`};
  min-width: 0;
  min-height: 0;

  @media (max-width: 1024px) {
    grid-template-columns: 60px 260px;
  }

  @media (max-width: 820px) {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 3100;
    grid-template-columns: 72px minmax(0, 1fr);
    width: min(88vw, 360px);
    transform: ${({ $isOpen }) => ($isOpen ? "translateX(0)" : "translateX(-105%)")};
    transition: transform 0.22s ease;
    box-shadow: 0 16px 34px rgba(16, 28, 48, 0.22);
  }
`;

export const MobileBackdrop = styled.button<{ $isOpen?: boolean }>`
  display: none;

  @media (max-width: 820px) {
    display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 72px;
    z-index: 3000;
    border: 0;
    background: rgba(8, 15, 29, 0.34);
    padding: 0;
    margin: 0;
  }

  @media (max-width: 640px) {
    left: 68px;
  }
`;

export const AppRail = styled.aside`
  background: #fafafa;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 0.5rem;

  @media (max-width: 820px) {
    position: relative;
    z-index: 3300;
  }

  @media (max-width: 640px) {
    gap: 0.35rem;
    padding: 0.65rem 0.3rem;
  }
`;

export const AppRailHeader = styled.button`
  width: 2rem;
  height: 2rem;
  border-radius: 0.7rem;
  border: 1px solid transparent;
  background: var(--accent);
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.18s ease;

  &:hover {
    background: #000000;
  }
`;

export const AppRailItem = styled.button<{ $isActive: boolean }>`
  width: 100%;
  box-sizing: border-box;
  border: 0;
  position: relative;
  background: ${({ $isActive }) => ($isActive ? "#f3f4f6" : "transparent")};
  color: ${({ $isActive }) => ($isActive ? "#111111" : "#4b5563")};
  border-radius: 0.7rem;
  padding: 0.5rem 0.2rem;
  display: grid;
  place-items: center;
  gap: 0.2rem;
  cursor: pointer;

  .rail-icon {
    width: 1.2rem;
    height: 1.2rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .rail-icon svg {
    width: 18px;
    height: 18px;
    display: block;
    flex-shrink: 0;
  }

  .rail-badge {
    position: absolute;
    top: 0.08rem;
    right: 0.52rem;
    min-width: 16px;
    height: 16px;
    padding: 0 3px;
    border-radius: 999px;
    background: #d93025;
    color: #ffffff;
    font-size: 0.58rem;
    font-weight: 700;
    line-height: 16px;
    text-align: center;
    border: 1px solid #f3f4f8;
    z-index: 2;
  }

  span:not(.rail-icon):not(.rail-badge) {
    font-size: 0.66rem;
    line-height: 1;
    font-weight: 600;
    display: block;
    width: 100%;
    text-align: center;
    white-space: nowrap;
  }

  @media (max-width: 820px) {
    padding: 0.45rem 0.15rem;

    span:not(.rail-icon):not(.rail-badge) {
      font-size: 0.62rem;
      padding: 0 1px;
    }
  }

  @media (max-width: 640px) {
    border-radius: 0.6rem;
    padding: 0.42rem 0.1rem;

    .rail-icon svg {
      width: 16px;
      height: 16px;
    }

    .rail-badge {
      right: 0.22rem;
    }

    span:not(.rail-icon):not(.rail-badge) {
      font-size: 0.58rem;
      line-height: 1;
      white-space: nowrap;
    }
  }
`;

export const AppRailBottom = styled.div`
  margin-top: auto;
  width: 100%;
`;

export const AppIconButton = styled.button`
  width: 100%;
  box-sizing: border-box;
  border: 0;
  background: transparent;
  color: #4c5667;
  border-radius: 0.7rem;
  padding: 0.45rem 0.25rem;
  display: grid;
  place-items: center;
  gap: 0.2rem;
  cursor: pointer;

  span {
    font-size: 0.62rem;
    font-weight: 700;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const LeftPanel = styled.aside<{ $isOpen?: boolean; $isCollapsed?: boolean }>`
  border-right: 1px solid #e5e7eb;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  min-width: ${({ $isCollapsed }) => ($isCollapsed ? "0" : "0")};
  width: ${({ $isCollapsed }) => ($isCollapsed ? "0" : "100%")};
  overflow: hidden;
  opacity: ${({ $isCollapsed }) => ($isCollapsed ? 0 : 1)};
  pointer-events: ${({ $isCollapsed }) => ($isCollapsed ? "none" : "auto")};
  transition: width 0.24s ease, opacity 0.18s ease;

  @media (max-width: 820px) {
    position: absolute;
    top: 0;
    left: 72px;
    bottom: 0;
    width: min(76vw, 300px);
    z-index: 3200;
    transform: ${({ $isOpen }) => ($isOpen ? "translateX(0)" : "translateX(-105%)")};
    transition: transform 0.22s ease;
    box-shadow: 0 16px 34px rgba(16, 28, 48, 0.22);
  }

  @media (max-width: 640px) {
    left: 68px;
    width: min(78vw, 280px);
  }
`;

export const LeftPanelHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid var(--border);
`;

export const IdentityTitle = styled.h2`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
`;

export const IdentitySubtitle = styled.p`
  margin: 0.2rem 0 0;
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
  padding: ${({ $singleItem }) => ($singleItem ? "0.85rem 0.6rem 1rem" : "0.35rem 0.6rem 1rem")};
  overflow-y: auto;
  scrollbar-gutter: stable;
  display: grid;
  gap: ${({ $singleItem }) => ($singleItem ? "0.5rem" : "0.35rem")};
`;

export const LeftPanelItem = styled.button<{ $isActive: boolean; $hasUnread?: boolean }>`
  position: relative;
  border: 1px solid
    ${({ $isActive, $hasUnread }) =>
      $isActive ? "#d1d5db" : $hasUnread ? "rgba(255, 106, 0, 0.35)" : "transparent"};
  background: ${({ $isActive, $hasUnread }) =>
    $isActive ? "#f3f4f6" : $hasUnread ? "rgba(255, 106, 0, 0.08)" : "transparent"};
  color: #111827;
  border-radius: 0.75rem;
  text-align: left;
  padding: 0.65rem 0.6rem;
  cursor: pointer;
  display: grid;
  gap: 0.2rem;
  transition: background-color 0.16s ease, border-color 0.16s ease, transform 0.16s ease;
  width: 100%;

  &:hover {
    background: ${({ $isActive }) => ($isActive ? "#f3f4f6" : "#f9fafb")};
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
  color: ${({ $online }) => ($online ? "#059669" : "#6b7280")};
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

export const ContentPane = styled.section`
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 10% 20%, #fafafa 0%, #f5f5f5 45%, #f3f4f6 100%);
`;

export const MobileTopBar = styled.div`
  display: none;

  @media (max-width: 820px) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 0.85rem 0;
  }
`;

export const MobileMenuButton = styled.button`
  display: none;

  @media (max-width: 820px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.45rem;
    border: 1px solid #171b30;
    background: #ffffff;
    color: #171b30;
    cursor: pointer;
  }
`;

export const ContentTopBar = styled.header`
  background: #ffffff;
  border-bottom: 1px solid var(--border);
  padding: 1rem 1.2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 820px) {
    padding: 0.85rem 0.9rem;
  }
`;

export const WorkspaceTitle = styled.h1`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
`;

export const SecondaryText = styled.p`
  margin: 0.2rem 0 0;
  color: var(--muted);
  font-size: 0.78rem;
`;

export const IdentityBadge = styled.div`
  border: 1px solid var(--border);
  background: #ffffff;
  color: #4b5563;
  border-radius: 999px;
  padding: 0.3rem 0.8rem;
  font-size: 0.78rem;
  font-weight: 600;
  max-width: 260px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const WorkspaceBody = styled.div`
  min-height: 0;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-gutter: stable both-edges;
  padding: 0 1rem 1rem;
  background: radial-gradient(circle at 10% 20%, #fafafa 0%, #f5f5f5 45%, #f3f4f6 100%);
 
  @media (max-width: 820px) {
    padding: 0 0.85rem 0.85rem;
  }

  @media (max-width: 640px) {
    padding: 0 0.65rem 0.65rem;
  }
`;
