import { useAppSelector } from '../../../app/hooks';
import { useSocket } from '../../../app/socket/useSocket';
import { useChatRealtimeHandler } from '../../chat/realtime/chatRealtimeHandler';
import { useGetUnreadCountQuery } from '../../notifications/api/notificationApi';
import { useDashboardRealtimeSync } from './useDashboardRealtimeSync';
import { useDashboardSelection } from './useDashboardSelection';
import { useDashboardProfilePrompt } from './useDashboardProfilePrompt';
import { useDashboardSessionActions } from './useDashboardSessionActions';

export const useDashboardPage = () => {
  const { socket } = useSocket();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const {
    railItems,
    safeActiveAppRailId,
    safeActivePanelId,
    filteredPanelItems,
    totalUnreadChats,
    activeChatUnreadCount,
    onAppRailChange,
    onLeftPanelChange,
    onOpenProfile,
  } = useDashboardSelection({
    currentUserId: currentUser?._id,
    currentUserRole: currentUser?.role,
  });

  const { data: unreadNotificationsResponse } = useGetUnreadCountQuery(undefined, {
    skip: !currentUser,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const totalUnreadNotifications = unreadNotificationsResponse?.data?.count ?? 0;

  const isHrUser = currentUser?.role === 'hr';
  const {
    isCompletingProfile,
    isCandidateUser,
    isProfilePromptOpen,
    isProfileFormOpen,
    profilePromptMessage,
    onCancelProfilePrompt,
    onOpenProfileForm,
    onCancelProfileForm,
    onSubmitProfile,
  } = useDashboardProfilePrompt({
    currentUser,
  });
  const {
    isLoggingOut,
    isLogoutConfirmOpen,
    onRequestLogout,
    onCancelLogout,
    onConfirmLogout,
  } = useDashboardSessionActions();

  useChatRealtimeHandler({
    socket,
    currentUserId: currentUser?._id,
    activeConversationId: safeActiveAppRailId === 'chat' ? safeActivePanelId : '',
    activeConversationUnreadCount: activeChatUnreadCount,
  });

  useDashboardRealtimeSync({
    currentUserId: currentUser?._id,
    socket,
  });

  return {
    currentUser,
    isLoggingOut,
    isCompletingProfile,
    railItems,
    safeActiveAppRailId,
    safeActivePanelId,
    filteredPanelItems,
    totalUnreadChats,
    totalUnreadNotifications,
    isHrUser,
    isCandidateUser,
    isProfilePromptOpen,
    isProfileFormOpen,
    isLogoutConfirmOpen,
    profilePromptMessage,
    onAppRailChange,
    onLeftPanelChange,
    onOpenProfile,
    onCancelProfilePrompt,
    onOpenProfileForm,
    onCancelProfileForm,
    onSubmitProfile,
    onRequestLogout,
    onCancelLogout,
    onConfirmLogout,
  };
};
