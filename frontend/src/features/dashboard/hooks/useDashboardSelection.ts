import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGetConversationsQuery } from '../../chat/api/chatApi';
import {
  getDashboardPathForPanel,
  getDashboardPathForRail,
  getRolePanelItems,
  getRoleRailItems,
  resolveDashboardSelection,
} from '../state';
import {
  buildChatPanelItems,
  getActiveChatUnreadCount,
  getLeftPanelItemsForRail,
  getNextPathForAppRailChange,
  getNextPathForLeftPanelChange,
  getSafeActiveAppRailId,
  getSafeActivePanelId,
  getTotalUnreadChats,
} from '../selectors/dashboardSelectionSelectors';
import type { LeftPanelItemData } from '../types/dashboardShellTypes';
import type { AuthRole } from '../../auth/types';

type UseDashboardSelectionParams = {
  currentUserId?: string;
  currentUserRole?: AuthRole;
};

export const useDashboardSelection = ({
  currentUserId,
  currentUserRole,
}: UseDashboardSelectionParams) => {
  const location = useLocation();
  const navigate = useNavigate();

  const panelItems = useMemo(() => getRolePanelItems(currentUserRole), [currentUserRole]);
  const railItems = useMemo(() => getRoleRailItems(currentUserRole), [currentUserRole]);
  const pathSelection = useMemo(
    () => resolveDashboardSelection(location.pathname, currentUserRole),
    [currentUserRole, location.pathname],
  );

  const safeActiveAppRailId = useMemo(
    () => getSafeActiveAppRailId(railItems, pathSelection.railId),
    [pathSelection.railId, railItems],
  );

  const safeActivePanelId = useMemo(
    () => getSafeActivePanelId(panelItems, pathSelection.panelId, safeActiveAppRailId),
    [panelItems, pathSelection.panelId, safeActiveAppRailId],
  );

  const { data: chatConversationsResponse } = useGetConversationsQuery(undefined, {
    skip: !currentUserId,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const chatConversations = useMemo(
    () => chatConversationsResponse?.data ?? [],
    [chatConversationsResponse?.data],
  );
  const chatPanelItems = useMemo<LeftPanelItemData[]>(
    () => buildChatPanelItems(chatConversations, currentUserId),
    [chatConversations, currentUserId],
  );

  const totalUnreadChats = useMemo(
    () => getTotalUnreadChats(chatConversations),
    [chatConversations],
  );
  const activeChatUnreadCount = useMemo(
    () => getActiveChatUnreadCount(chatConversations, pathSelection.panelId),
    [chatConversations, pathSelection.panelId],
  );

  const filteredPanelItems = useMemo(
    () => getLeftPanelItemsForRail(safeActiveAppRailId, panelItems, chatPanelItems),
    [chatPanelItems, panelItems, safeActiveAppRailId],
  );

  useEffect(() => {
    if (
      !currentUserRole ||
      (location.pathname !== '/dashboard' && location.pathname !== '/dashboard/')
    ) {
      return;
    }

    navigate(getDashboardPathForRail(railItems[0]?.id ?? 'chat', currentUserRole), {
      replace: true,
    });
  }, [currentUserRole, location.pathname, navigate, railItems]);

  useEffect(() => {
    if (!currentUserRole) {
      return;
    }

    if (
      !pathSelection.isValid &&
      location.pathname !== '/dashboard' &&
      location.pathname !== '/dashboard/'
    ) {
      navigate('/not-found', { replace: true });
    }
  }, [currentUserRole, location.pathname, navigate, pathSelection.isValid]);

  useEffect(() => {
    if (
      safeActiveAppRailId !== 'chat' ||
      !pathSelection.panelId ||
      !chatConversationsResponse ||
      location.pathname === '/dashboard/chats'
    ) {
      return;
    }

    const conversationExists = (chatConversationsResponse.data ?? []).some(
      (conversation) => conversation._id === pathSelection.panelId,
    );

    if (!conversationExists) {
      navigate('/not-found', { replace: true });
    }
  }, [
    chatConversationsResponse,
    location.pathname,
    navigate,
    pathSelection.panelId,
    safeActiveAppRailId,
  ]);

  useEffect(() => {
    if (
      safeActiveAppRailId !== 'chat' ||
      location.pathname !== '/dashboard/chats' ||
      !chatConversationsResponse
    ) {
      return;
    }

    const firstConversationId = chatConversationsResponse.data?.[0]?._id;
    if (!firstConversationId) {
      return;
    }

    navigate(`/dashboard/chats/${firstConversationId}`, { replace: true });
  }, [chatConversationsResponse, location.pathname, navigate, safeActiveAppRailId]);

  const onAppRailChange = (appRailId: string): boolean => {
    navigate(
      getNextPathForAppRailChange(
        appRailId,
        panelItems,
        currentUserRole,
        getDashboardPathForPanel,
        getDashboardPathForRail,
      ),
    );

    return true;
  };

  const onLeftPanelChange = (panelId: string): void => {
    navigate(
      getNextPathForLeftPanelChange(
        panelId,
        panelItems,
        chatPanelItems,
        safeActiveAppRailId,
        currentUserRole,
        getDashboardPathForPanel,
      ),
    );
  };

  const onOpenProfile = (): void => {
    const profilePanel = panelItems.find((item) => item.appRailId === 'profile');
    navigate(getDashboardPathForPanel(profilePanel?.id ?? '', currentUserRole));
  };

  return {
    panelItems,
    railItems,
    safeActiveAppRailId,
    safeActivePanelId,
    filteredPanelItems,
    totalUnreadChats,
    activeChatUnreadCount,
    onAppRailChange,
    onLeftPanelChange,
    onOpenProfile,
  };
};
