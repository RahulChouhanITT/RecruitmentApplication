import styled from "styled-components";

export const ShellRoot = styled.main`
  width: 100%;
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  background: linear-gradient(180deg, #f6f8fc 0%, #eef2f9 100%);
`;

export const PageLayout = styled.section`
  --rail-bg: #f3f4f8;
  --panel-bg: #f7f8fb;
  --surface: #ffffff;
  --border: #dde2ea;
  --text: #1f2430;
  --muted: #637083;
  --accent: #4866ef;

  width: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: 72px 320px minmax(0, 1fr);
  color: var(--text);

  @media (max-width: 1024px) {
    grid-template-columns: 60px 260px minmax(0, 1fr);
  }

  @media (max-width: 820px) {
    grid-template-columns: 58px minmax(0, 1fr);
  }
`;

export const AppRail = styled.aside`
  background: var(--rail-bg);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 0.5rem;
`;

export const AppRailHeader = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 0.7rem;
  background: var(--accent);
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 700;
  display: grid;
  place-items: center;
`;

export const AppRailItem = styled.button<{ $isActive: boolean }>`
  width: 100%;
  border: 0;
  background: ${({ $isActive }) => ($isActive ? "rgba(72, 102, 239, 0.12)" : "transparent")};
  color: ${({ $isActive }) => ($isActive ? "#1f2f8f" : "#556273")};
  border-radius: 0.7rem;
  padding: 0.5rem 0.2rem;
  display: grid;
  place-items: center;
  gap: 0.2rem;
  cursor: pointer;

  span {
    font-size: 0.66rem;
    line-height: 1;
    font-weight: 600;
  }
`;

export const AppRailBottom = styled.div`
  margin-top: auto;
  width: 100%;
`;

export const AppIconButton = styled.button`
  width: 100%;
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

export const LeftPanel = styled.aside`
  border-right: 1px solid var(--border);
  background: var(--panel-bg);
  display: flex;
  flex-direction: column;
  min-width: 0;

  @media (max-width: 820px) {
    display: none;
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
  color: #75839b;

  input {
    border: 0;
    outline: none;
    background: transparent;
    width: 100%;
    color: #273041;
    font-size: 0.82rem;
  }
`;

export const LeftPanelList = styled.div`
  padding: 0 0.6rem 1rem;
  overflow-y: auto;
  display: grid;
  gap: 0.35rem;
`;

export const LeftPanelItem = styled.button<{ $isActive: boolean }>`
  border: 1px solid ${({ $isActive }) => ($isActive ? "rgba(72, 102, 239, 0.25)" : "transparent")};
  background: ${({ $isActive }) => ($isActive ? "rgba(72, 102, 239, 0.12)" : "transparent")};
  color: #1f2430;
  border-radius: 0.65rem;
  text-align: left;
  padding: 0.65rem 0.6rem;
  cursor: pointer;
  display: grid;
  gap: 0.2rem;

  strong {
    font-size: 0.82rem;
  }

  span {
    font-size: 0.74rem;
    color: #617083;
  }
`;

export const ContentPane = styled.section`
  min-width: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
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
  background: #f8f9fc;
  color: #4e5a6b;
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
  overflow: auto;
  padding: 1.1rem;
 
  @media (max-width: 820px) {
    padding: 0.85rem;
  }
`;
