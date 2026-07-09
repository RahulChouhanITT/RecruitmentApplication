import { useEffect, useMemo, useState } from 'react';
import type { AuthRole } from '../../auth/types';
import type { LeftPanelItemData } from '../types/dashboardShellTypes';

const getRoleLabel = (role: AuthRole | undefined): string => {
  if (role === 'hr') {
    return 'HR Workspace';
  }
  if (role === 'interviewer') {
    return 'Interviewer Workspace';
  }
  return 'Candidate Workspace';
};

export const useWorkspaceShell = (
  leftPanelItems: LeftPanelItemData[],
  activeAppRailId?: string,
) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [leftPanelSearchQuery, setLeftPanelSearchQuery] = useState('');

  useEffect(() => {
    const onEsc = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setLeftPanelSearchQuery('');
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [activeAppRailId]);

  const closeSidebar = (): void => {
    setIsSidebarOpen(false);
  };

  const openSidebar = (): void => {
    setIsSidebarOpen(true);
  };

  const normalizedSearchQuery = leftPanelSearchQuery.trim().toLowerCase();
  const filteredLeftPanelItems = useMemo(() => {
    if (!normalizedSearchQuery) {
      return leftPanelItems;
    }

    return leftPanelItems.filter((item) => {
      const title = item.title.toLowerCase();
      const subtitle = item.subtitle.toLowerCase();
      return title.includes(normalizedSearchQuery) || subtitle.includes(normalizedSearchQuery);
    });
  }, [leftPanelItems, normalizedSearchQuery]);

  const shouldShowSearch = leftPanelItems.length > 1;
  const isSinglePanelItem = leftPanelItems.length === 1;
  const itemsToRender = shouldShowSearch ? filteredLeftPanelItems : leftPanelItems;
  const shouldCollapseLeftPanel = isLeftPanelCollapsed;

  const onToggleSidebar = (): void => {
    if (typeof window !== 'undefined' && window.innerWidth <= 820) {
      setIsSidebarOpen((prev) => !prev);
      return;
    }

    setIsLeftPanelCollapsed((prev) => !prev);
  };

  return {
    isSidebarOpen,
    isLeftPanelCollapsed,
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
  };
};
