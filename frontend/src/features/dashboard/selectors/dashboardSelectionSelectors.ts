import { getChatAvatarText } from '../../chat/utils/chatCacheHelpers';
import type { ChatConversation } from '../../../types/chatTypes';
import type { AuthRole } from '../../auth/types';
import type { LeftPanelItemData, LeftRailItem } from '../types/dashboardShellTypes';

export const getSafeActiveAppRailId = (
  railItems: LeftRailItem[],
  candidateRailId: string,
): string => {
  if (railItems.some((item) => item.id === candidateRailId)) {
    return candidateRailId;
  }

  return railItems[0]?.id ?? '';
};

export const getSafeActivePanelId = (
  panelItems: LeftPanelItemData[],
  candidatePanelId: string,
  activeAppRailId: string,
): string => {
  if (activeAppRailId === 'chat') {
    return candidatePanelId;
  }

  const matchedPanels = panelItems.filter((item) => item.appRailId === activeAppRailId);
  if (matchedPanels.some((item) => item.id === candidatePanelId)) {
    return candidatePanelId;
  }

  return matchedPanels[0]?.id ?? '';
};

export const buildChatPanelItems = (
  conversations: ChatConversation[],
  currentUserId?: string,
): LeftPanelItemData[] => {
  return conversations.map((conversation) => {
    const counterpart = conversation.participants.find(
      (participant) => participant._id !== currentUserId,
    );
    const name = counterpart?.name ?? 'Conversation';

    return {
      id: conversation._id,
      title: name,
      subtitle: counterpart?.role ?? '',
      appRailId: 'chat',
      avatarText: getChatAvatarText(name),
      presence: counterpart?.isOnline ? 'online' : 'offline',
      unreadCount: conversation.unreadCount ?? 0,
    };
  });
};

export const getTotalUnreadChats = (conversations: ChatConversation[]): number => {
  return conversations.reduce((sum, conversation) => sum + (conversation.unreadCount ?? 0), 0);
};

export const getActiveChatUnreadCount = (
  conversations: ChatConversation[],
  conversationId: string,
): number => {
  return conversations.find((conversation) => conversation._id === conversationId)?.unreadCount ?? 0;
};

export const getLeftPanelItemsForRail = (
  activeAppRailId: string,
  panelItems: LeftPanelItemData[],
  chatPanelItems: LeftPanelItemData[],
): LeftPanelItemData[] => {
  if (activeAppRailId === 'chat') {
    return chatPanelItems;
  }

  return panelItems.filter((item) => item.appRailId === activeAppRailId);
};

export const getNextPathForAppRailChange = (
  appRailId: string,
  panelItems: LeftPanelItemData[],
  currentUserRole: AuthRole | undefined,
  getDashboardPathForPanel: (panelId: string, role: AuthRole | undefined) => string,
  getDashboardPathForRail: (railId: string, role: AuthRole | undefined) => string,
): string => {
  const matchedPanels = panelItems.filter((item) => item.appRailId === appRailId);

  return appRailId === 'chat'
    ? '/dashboard/chats'
    : matchedPanels[0]?.id
      ? getDashboardPathForPanel(matchedPanels[0].id, currentUserRole)
      : getDashboardPathForRail(appRailId, currentUserRole);
};

export const getNextPathForLeftPanelChange = (
  panelId: string,
  panelItems: LeftPanelItemData[],
  chatPanelItems: LeftPanelItemData[],
  activeAppRailId: string,
  currentUserRole: AuthRole | undefined,
  getDashboardPathForPanel: (panelId: string, role: AuthRole | undefined) => string,
): string => {
  const selectedPanel =
    panelItems.find((item) => item.id === panelId) ??
    chatPanelItems.find((item) => item.id === panelId);
  const nextRailId = selectedPanel?.appRailId ?? activeAppRailId;

  return nextRailId === 'chat'
    ? `/dashboard/chats/${panelId}`
    : getDashboardPathForPanel(panelId, currentUserRole);
};
