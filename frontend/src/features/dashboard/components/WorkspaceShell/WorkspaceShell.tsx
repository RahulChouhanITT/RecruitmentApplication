import { type PropsWithChildren, type ReactNode } from "react";
import {
  FiCalendar,
  FiFileText,
  FiLogOut,
  FiMenu,
  FiMessageSquare,
  FiPhone,
  FiSearch,
} from "react-icons/fi";
import { useAppSelector } from "../../../../app/hooks";
import { useWorkspaceShell } from "../../hooks/useWorkspaceShell";
import { DASHBOARD_MESSAGES, DASHBOARD_WORKSPACE_LABELS } from "../../labels/dashboardLabels";
import {
  AppIconButton,
  AppRail,
  AppRailBottom,
  AppRailHeader,
  AppRailItem,
  ContentPane,
  IdentitySubtitle,
  IdentityTitle,
  LeftPanel,
  LeftPanelHeader,
  LeftPanelItem,
  LeftPanelItemAvatar,
  LeftPanelItemMeta,
  LeftPanelItemRow,
  LeftPanelItemRight,
  LeftPanelItemStatus,
  LeftPanelItemUnreadBadge,
  LeftPanelList,
  LeftPanelSearch,
  MobileBackdrop,
  PageLayout,
  ShellRoot,
  WorkspaceBody,
} from "./WorkspaceShell.styles";
import { AppHeader } from "../../../../shared/components/AppHeader/AppHeader";

type WorkspaceShellProps = PropsWithChildren<{
  onLogout: () => Promise<void> | void;
  isLoggingOut?: boolean;
  onProfileClick?: () => void;
  totalUnreadChats?: number;
  leftPanelWidth?: number;
  leftPanelItems?: LeftPanelItemData[];
  appRailItems?: LeftRailItem[];
  activeLeftPanelId?: string;
  onLeftPanelChange?: (itemId: string) => void;
  activeAppRailId?: string;
  onAppRailChange?: (itemId: string) => boolean | void;
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
  avatarText?: string;
  presence?: "online" | "offline";
  unreadCount?: number;
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

export const WorkspaceShell = ({
  onLogout,
  isLoggingOut = false,
  onProfileClick,
  totalUnreadChats = 0,
  leftPanelWidth = 320,
  leftPanelItems = DEFAULT_LEFT_PANEL_ITEMS,
  appRailItems = LEFT_RAIL_ITEMS,
  activeLeftPanelId,
  onLeftPanelChange,
  activeAppRailId,
  onAppRailChange,
  children,
}: WorkspaceShellProps) => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const {
    isSidebarOpen,
    leftPanelSearchQuery,
    setLeftPanelSearchQuery,
    openSidebar,
    closeSidebar,
    itemsToRender,
    shouldShowSearch,
    isSinglePanelItem,
    shouldCollapseLeftPanel,
    onToggleSidebar,
    getRoleLabel,
  } = useWorkspaceShell(leftPanelItems, activeAppRailId);

  return (
    <ShellRoot>
      <AppHeader onProfileClick={onProfileClick} />

      <PageLayout $leftPanelWidth={leftPanelWidth} $isLeftPanelCollapsed={shouldCollapseLeftPanel}>
        <AppRail>
          <AppRailHeader
            type="button"
            onClick={onToggleSidebar}
            aria-label={
              shouldCollapseLeftPanel
                ? DASHBOARD_WORKSPACE_LABELS.EXPAND_SIDEBAR
                : DASHBOARD_WORKSPACE_LABELS.COLLAPSE_SIDEBAR
            }
            title={
              shouldCollapseLeftPanel
                ? DASHBOARD_WORKSPACE_LABELS.EXPAND_SIDEBAR
                : DASHBOARD_WORKSPACE_LABELS.COLLAPSE_SIDEBAR
            }
          >
            <FiMenu size={15} />
          </AppRailHeader>

          {appRailItems.map((item, index) => (
            <AppRailItem
              key={item.id}
              $isActive={activeAppRailId ? activeAppRailId === item.id : index === 0}
              onClick={() => {
                const isDirectOpen = onAppRailChange?.(item.id) === true;
                if (isDirectOpen) {
                  closeSidebar();
                  return;
                }
                openSidebar();
              }}
            >
              <span className="rail-icon">{item.icon}</span>
              {item.id === "chat" && totalUnreadChats > 0 ? (
                <span className="rail-badge">{totalUnreadChats > 99 ? "99+" : totalUnreadChats}</span>
              ) : null}
              <span>{item.label}</span>
            </AppRailItem>
          ))}

          <AppRailBottom>
          <AppIconButton type="button" onClick={onLogout} disabled={isLoggingOut}>
              <FiLogOut size={16} />
              <span>{isLoggingOut ? DASHBOARD_MESSAGES.LOGGING_OUT : DASHBOARD_MESSAGES.LOGOUT}</span>
            </AppIconButton>
          </AppRailBottom>
        </AppRail>

        <LeftPanel $isOpen={isSidebarOpen} $isCollapsed={shouldCollapseLeftPanel}>
          <LeftPanelHeader>
            <IdentityTitle>{currentUser?.name || DASHBOARD_WORKSPACE_LABELS.DEFAULT_USER}</IdentityTitle>
            <IdentitySubtitle>{getRoleLabel(currentUser?.role)}</IdentitySubtitle>
          </LeftPanelHeader>

          {leftPanelItems.length > 0 ? (
            <>
              {shouldShowSearch ? (
                <LeftPanelSearch>
                  <FiSearch size={15} />
                  <input
                    type="text"
                    placeholder={DASHBOARD_WORKSPACE_LABELS.SEARCH_PLACEHOLDER}
                    aria-label={DASHBOARD_WORKSPACE_LABELS.SEARCH_PLACEHOLDER}
                    value={leftPanelSearchQuery}
                    onChange={(event) => setLeftPanelSearchQuery(event.target.value)}
                  />
                </LeftPanelSearch>
              ) : null}

              <LeftPanelList $singleItem={isSinglePanelItem}>
                {itemsToRender.map((item, index) => (
                  <LeftPanelItem
                    key={item.id}
                    $isActive={activeLeftPanelId ? activeLeftPanelId === item.id : index === 0}
                    $hasUnread={Boolean(item.unreadCount && item.unreadCount > 0)}
                    onClick={() => {
                      onLeftPanelChange?.(item.id);
                      closeSidebar();
                    }}
                  >
                    <LeftPanelItemRow>
                      {item.avatarText ? <LeftPanelItemAvatar>{item.avatarText}</LeftPanelItemAvatar> : null}
                      <LeftPanelItemMeta>
                        <strong>{item.title}</strong>
                        <span>{item.subtitle}</span>
                      </LeftPanelItemMeta>
                      <LeftPanelItemRight>
                        {item.presence ? (
                          <LeftPanelItemStatus $online={item.presence === "online"}>
                            {item.presence === "online"
                              ? DASHBOARD_WORKSPACE_LABELS.ONLINE
                              : DASHBOARD_WORKSPACE_LABELS.OFFLINE}
                          </LeftPanelItemStatus>
                        ) : null}
                        {item.unreadCount && item.unreadCount > 0 ? (
                          <LeftPanelItemUnreadBadge>
                            {item.unreadCount > 99 ? "99+" : item.unreadCount}
                          </LeftPanelItemUnreadBadge>
                        ) : null}
                      </LeftPanelItemRight>
                    </LeftPanelItemRow>
                  </LeftPanelItem>
                ))}
              </LeftPanelList>
            </>
          ) : null}
        </LeftPanel>

        <MobileBackdrop
          type="button"
          aria-label={DASHBOARD_WORKSPACE_LABELS.CLOSE_SIDEBAR}
          onClick={closeSidebar}
          $isOpen={isSidebarOpen}
        />

        <ContentPane>
          <WorkspaceBody>{children}</WorkspaceBody>
        </ContentPane>
      </PageLayout>
    </ShellRoot>
  );
};
