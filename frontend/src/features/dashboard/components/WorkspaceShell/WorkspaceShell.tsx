import type { PropsWithChildren, ReactNode } from "react";
import {
  FiCalendar,
  FiFileText,
  FiLogOut,
  FiMessageSquare,
  FiPhone,
  FiSearch,
} from "react-icons/fi";
import { useAppSelector } from "../../../../app/hooks";
import type { AuthRole } from "../../../auth/types";
import {
  AppIconButton,
  AppRail,
  AppRailBottom,
  AppRailHeader,
  AppRailItem,
  ContentPane,
  ContentTopBar,
  IdentityBadge,
  IdentitySubtitle,
  IdentityTitle,
  LeftPanel,
  LeftPanelHeader,
  LeftPanelItem,
  LeftPanelList,
  LeftPanelSearch,
  PageLayout,
  SecondaryText,
  ShellRoot,
  WorkspaceBody,
  WorkspaceTitle,
} from "./WorkspaceShell.styles";
import { AppHeader } from "../../../../shared/components/AppHeader/AppHeader";

type WorkspaceShellProps = PropsWithChildren<{
  title: string;
  onLogout: () => Promise<void> | void;
  isLoggingOut?: boolean;
  topBarRight?: ReactNode;
  leftPanelItems?: LeftPanelItemData[];
  appRailItems?: LeftRailItem[];
  activeLeftPanelId?: string;
  onLeftPanelChange?: (itemId: string) => void;
  activeAppRailId?: string;
  onAppRailChange?: (itemId: string) => void;
}>;

export type LeftRailItem = {
  id: string;
  label: string;
  icon: ReactNode;
};

export type LeftPanelItemData = {
  id: string;
  title: string;
  subtitle: string;
  appRailId?: string;
};

const LEFT_RAIL_ITEMS: LeftRailItem[] = [
  { id: "chat", label: "Chats", icon: <FiMessageSquare size={18} /> },
  { id: "calendar", label: "Calendar", icon: <FiCalendar size={18} /> },
  { id: "calls", label: "Calls", icon: <FiPhone size={18} /> },
  { id: "files", label: "Files", icon: <FiFileText size={18} /> },
];

const DEFAULT_LEFT_PANEL_ITEMS: LeftPanelItemData[] = [
  { id: "general", title: "General Updates", subtitle: "Team-wide communication" },
  { id: "hiring", title: "Hiring Pipeline", subtitle: "Candidate stage discussion" },
  { id: "interviews", title: "Interview Planning", subtitle: "Schedule and panel sync" },
  { id: "docs", title: "Shared Docs", subtitle: "Policies and templates" },
];

const getRoleLabel = (role: AuthRole | undefined): string => {
  if (role === "hr") {
    return "HR Workspace";
  }
  if (role === "interviewer") {
    return "Interviewer Workspace";
  }
  return "Candidate Workspace";
};

export const WorkspaceShell = ({
  title,
  onLogout,
  isLoggingOut = false,
  topBarRight,
  leftPanelItems = DEFAULT_LEFT_PANEL_ITEMS,
  appRailItems = LEFT_RAIL_ITEMS,
  activeLeftPanelId,
  onLeftPanelChange,
  activeAppRailId,
  onAppRailChange,
  children,
}: WorkspaceShellProps) => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  return (
    <ShellRoot>
      <AppHeader />

      <PageLayout>
        <AppRail>
          <AppRailHeader>RA</AppRailHeader>

          {appRailItems.map((item, index) => (
            <AppRailItem
              key={item.id}
              $isActive={activeAppRailId ? activeAppRailId === item.id : index === 0}
              onClick={() => onAppRailChange?.(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </AppRailItem>
          ))}

          <AppRailBottom>
            <AppIconButton type="button" onClick={onLogout} disabled={isLoggingOut}>
              <FiLogOut size={16} />
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </AppIconButton>
          </AppRailBottom>
        </AppRail>

        <LeftPanel>
          <LeftPanelHeader>
            <IdentityTitle>{currentUser?.name || "Workspace User"}</IdentityTitle>
            <IdentitySubtitle>{getRoleLabel(currentUser?.role)}</IdentitySubtitle>
          </LeftPanelHeader>

          <LeftPanelSearch>
            <FiSearch size={15} />
            <input type="text" placeholder="Search chats and channels" aria-label="Search" />
          </LeftPanelSearch>

          <LeftPanelList>
            {leftPanelItems.map((item, index) => (
              <LeftPanelItem
                key={item.id}
                $isActive={activeLeftPanelId ? activeLeftPanelId === item.id : index === 0}
                onClick={() => onLeftPanelChange?.(item.id)}
              >
                <strong>{item.title}</strong>
                <span>{item.subtitle}</span>
              </LeftPanelItem>
            ))}
          </LeftPanelList>
        </LeftPanel>

        <ContentPane>
          <ContentTopBar>
            <div>
              <WorkspaceTitle>{title}</WorkspaceTitle>
              <SecondaryText>Common dashboard shell for all roles</SecondaryText>
            </div>

            {topBarRight ?? (
              <IdentityBadge>
                <span>{currentUser?.email || "user@company.com"}</span>
              </IdentityBadge>
            )}
          </ContentTopBar>

          <WorkspaceBody>{children}</WorkspaceBody>
        </ContentPane>
      </PageLayout>
    </ShellRoot>
  );
};
