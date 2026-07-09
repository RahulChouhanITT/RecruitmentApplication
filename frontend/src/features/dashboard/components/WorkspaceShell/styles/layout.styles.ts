import styled from 'styled-components';

export const ShellRoot = styled.main`
  width: 100%;
  height: 100dvh;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  background: linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%);
  overflow: hidden;
`;

export const PageLayout = styled.section<{
  $leftPanelWidth?: number;
  $isLeftPanelCollapsed?: boolean;
  $isResizing?: boolean;
}>`
  --rail-width: 72px;
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
  grid-template-columns:
    var(--rail-width)
    ${({ $leftPanelWidth, $isLeftPanelCollapsed }) =>
      $isLeftPanelCollapsed ? '0px' : `${$leftPanelWidth ?? 320}px`}
    minmax(0, 1fr);
  color: var(--text);
  min-height: 0;
  position: relative;
  transition: ${({ $isResizing }) => ($isResizing ? 'none' : 'grid-template-columns 0.24s ease')};

  @media (max-width: 1024px) {
    --rail-width: 60px;
  }

  @media (max-width: 820px) {
    --rail-width: 72px;
    grid-template-columns: var(--rail-width) minmax(0, 1fr);
  }

  @media (max-width: 640px) {
    --rail-width: 68px;
  }
`;

export const ResizeHandle = styled.button<{
  $leftPanelWidth?: number;
  $isLeftPanelCollapsed?: boolean;
  $isActive?: boolean;
}>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: ${({ $leftPanelWidth, $isLeftPanelCollapsed }) =>
    $isLeftPanelCollapsed
      ? 'calc(var(--rail-width) - 4px)'
      : `calc(var(--rail-width) + ${$leftPanelWidth ?? 320}px - 4px)`};
  width: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: col-resize;
  z-index: 40;
  touch-action: none;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
    transform: translateX(-50%);
    background: ${({ theme, $isActive }) =>
      $isActive ? theme.colors.primary : theme.colors.borderMuted};
    transition: ${({ $isActive }) => ($isActive ? 'none' : 'background 0.18s ease, width 0.18s ease')};
  }

  &:hover::before,
  &:focus-visible::before {
    width: 2px;
    background: ${({ theme }) => theme.colors.primary};
  }

  &:focus-visible {
    outline: none;
  }

  @media (max-width: 820px) {
    display: none;
  }
`;

export const MobileBackdrop = styled.button<{ $isOpen?: boolean }>`
  display: none;

  @media (max-width: 820px) {
    display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
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

export const ContentPane = styled.section`
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 10% 20%, #fafafa 0%, #f5f5f5 45%, #f3f4f6 100%);
`;

export const WorkspaceBody = styled.div<{ $flush?: boolean }>`
  min-height: 0;
  height: 100%;
  overflow-y: ${({ $flush }) => ($flush ? 'hidden' : 'auto')};
  overflow-x: hidden;
  scrollbar-gutter: ${({ $flush }) => ($flush ? 'auto' : 'stable both-edges')};
  padding: ${({ $flush }) => ($flush ? '0' : '0 1rem 1rem')};
  background: radial-gradient(circle at 10% 20%, #fafafa 0%, #f5f5f5 45%, #f3f4f6 100%);

  @media (max-width: 820px) {
    padding: ${({ $flush }) => ($flush ? '0' : '0 0.85rem 0.85rem')};
  }

  @media (max-width: 640px) {
    padding: ${({ $flush }) => ($flush ? '0' : '0 0.65rem 0.65rem')};
  }
`;
