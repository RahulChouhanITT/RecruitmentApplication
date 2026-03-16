import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { showToast, TOAST_TYPES } from "../../../utils/toast";
import { authApi, useCompleteProfileMutation, useLogoutMutation } from "../../auth/api/authApi";
import { candidateApi } from "../../candidate/api/candidateApi";
import type { CompleteProfilePayload } from "../../auth/types/authTypes";
import { clearCurrentUser, setCurrentUser } from "../../auth/state/authSlice";
import { jobsApi } from "../../jobs/api/jobsApi";
import { chatApi, useGetConversationsQuery } from "../api/chatApi";
import {
  DASHBOARD_MESSAGES,
  DASHBOARD_PROFILE_LABELS,
} from "../labels/dashboardLabels";
import {
  getDashboardPathForPanel,
  getDashboardPathForRail,
  getRolePanelItems,
  getRoleRailItems,
  resolveDashboardSelection,
} from "../state/dashboardNavigation";
import type { LeftPanelItemData } from "../components/WorkspaceShell/WorkspaceShell";
import {
  getAvatarText,
  getDashboardErrorMessage,
  updateConversationCache,
  updateConversationPresence,
} from "../utils/dashboardHelpers";
import { API_BASE_URL } from "../utils/chatThreadHelpers";

export const useDashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [completeProfileMutation, { isLoading: isCompletingProfile }] = useCompleteProfileMutation();
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [dismissedProfilePromptForUserId, setDismissedProfilePromptForUserId] = useState<string | null>(null);

  const panelItems = useMemo(() => getRolePanelItems(currentUser?.role), [currentUser?.role]);
  const railItems = useMemo(() => getRoleRailItems(currentUser?.role), [currentUser?.role]);
  const pathSelection = useMemo(
    () => resolveDashboardSelection(location.pathname, currentUser?.role),
    [currentUser?.role, location.pathname]
  );

  const safeActiveAppRailId = useMemo(() => {
    if (railItems.some((item) => item.id === pathSelection.railId)) {
      return pathSelection.railId;
    }
    return railItems[0]?.id ?? "";
  }, [pathSelection.railId, railItems]);

  const safeActivePanelId = useMemo(() => {
    if (safeActiveAppRailId === "chat") {
      return pathSelection.panelId;
    }

    const matchedPanels = panelItems.filter((item) => item.appRailId === safeActiveAppRailId);
    if (matchedPanels.some((item) => item.id === pathSelection.panelId)) {
      return pathSelection.panelId;
    }
    return matchedPanels[0]?.id ?? "";
  }, [panelItems, pathSelection.panelId, safeActiveAppRailId]);

  const { data: chatConversationsResponse, refetch: refetchChatConversations } = useGetConversationsQuery(undefined, {
    skip: !currentUser,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const chatPanelItems = useMemo<LeftPanelItemData[]>(() => {
    const conversations = chatConversationsResponse?.data ?? [];
    return conversations.map((conversation) => {
      const counterpart = conversation.participants.find((participant) => participant._id !== currentUser?._id);
      const name = counterpart?.name ?? "Conversation";
      return {
        id: conversation._id,
        title: name,
        subtitle: counterpart?.role ?? "",
        appRailId: "chat",
        avatarText: getAvatarText(name),
        presence: counterpart?.isOnline ? "online" : "offline",
        unreadCount: conversation.unreadCount ?? 0,
      };
    });
  }, [chatConversationsResponse?.data, currentUser?._id]);

  const totalUnreadChats = useMemo(() => {
    const conversations = chatConversationsResponse?.data ?? [];
    return conversations.reduce((sum, conversation) => sum + (conversation.unreadCount ?? 0), 0);
  }, [chatConversationsResponse?.data]);

  const filteredPanelItems = useMemo(() => {
    if (safeActiveAppRailId === "chat") {
      return chatPanelItems;
    }
    return panelItems.filter((item) => item.appRailId === safeActiveAppRailId);
  }, [chatPanelItems, panelItems, safeActiveAppRailId]);

  const isHrUser = currentUser?.role === "hr";
  const isCandidateUser = currentUser?.role === "candidate";
  const shouldPromptForProfileCompletion = Boolean(currentUser && !currentUser.profileCompleted);
  const profilePromptMessage = isCandidateUser
    ? DASHBOARD_PROFILE_LABELS.CANDIDATE_PROMPT
    : DASHBOARD_PROFILE_LABELS.DEFAULT_PROMPT;
  const isProfilePromptOpen =
    shouldPromptForProfileCompletion &&
    !isProfileFormOpen &&
    dismissedProfilePromptForUserId !== (currentUser?._id ?? null);

  useEffect(() => {
    if (!currentUser?._id) {
      return;
    }

    const socket = io(API_BASE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    const onConversationUpdated = (payload: {
      conversationId?: string;
      unreadCount?: number;
      lastMessage?: string;
      lastMessageAt?: string | null;
    }): void => {
      dispatch(
        chatApi.util.updateQueryData("getConversations", undefined, (draft) => {
          draft.data = updateConversationCache(draft.data ?? [], payload);
        })
      );
    };

    const onConversationCreated = (): void => {
      void refetchChatConversations();
    };

    const onPresenceChanged = (payload: { userId?: string; isOnline?: boolean }): void => {
      dispatch(
        chatApi.util.updateQueryData("getConversations", undefined, (draft) => {
          updateConversationPresence(draft.data ?? [], payload);
        })
      );
    };

    socket.on("chat:conversation_updated", onConversationUpdated);
    socket.on("chat:conversation_created", onConversationCreated);
    socket.on("presence:changed", onPresenceChanged);

    return () => {
      socket.off("chat:conversation_updated", onConversationUpdated);
      socket.off("chat:conversation_created", onConversationCreated);
      socket.off("presence:changed", onPresenceChanged);
      socket.disconnect();
    };
  }, [currentUser?._id, dispatch, refetchChatConversations]);

  useEffect(() => {
    if (!currentUser?.role || (location.pathname !== "/dashboard" && location.pathname !== "/dashboard/")) {
      return;
    }

    navigate(getDashboardPathForRail(railItems[0]?.id ?? "chat", currentUser.role), { replace: true });
  }, [currentUser?.role, location.pathname, navigate, railItems]);

  useEffect(() => {
    if (!currentUser?.role) {
      return;
    }

    if (!pathSelection.isValid && location.pathname !== "/dashboard" && location.pathname !== "/dashboard/") {
      navigate("/not-found", { replace: true });
    }
  }, [currentUser?.role, location.pathname, navigate, pathSelection.isValid]);

  useEffect(() => {
    if (
      safeActiveAppRailId !== "chat" ||
      !pathSelection.panelId ||
      !chatConversationsResponse ||
      location.pathname === "/dashboard/chats"
    ) {
      return;
    }

    const conversationExists = (chatConversationsResponse.data ?? []).some(
      (conversation) => conversation._id === pathSelection.panelId
    );

    if (!conversationExists) {
      navigate("/not-found", { replace: true });
    }
  }, [
    chatConversationsResponse,
    location.pathname,
    navigate,
    pathSelection.panelId,
    safeActiveAppRailId,
  ]);

  const onAppRailChange = (appRailId: string): boolean => {
    const matchedPanels = panelItems.filter((item) => item.appRailId === appRailId);
    navigate(
      appRailId === "chat"
        ? "/dashboard/chats"
        : matchedPanels[0]?.id
          ? getDashboardPathForPanel(matchedPanels[0].id, currentUser?.role)
          : getDashboardPathForRail(appRailId, currentUser?.role)
    );

    return true;
  };

  const onLeftPanelChange = (panelId: string): void => {
    const selectedPanel =
      panelItems.find((item) => item.id === panelId) ?? chatPanelItems.find((item) => item.id === panelId);
    const nextRailId = selectedPanel?.appRailId ?? safeActiveAppRailId;
    navigate(nextRailId === "chat" ? `/dashboard/chats/${panelId}` : getDashboardPathForPanel(panelId, currentUser?.role));
  };

  const onOpenProfile = (): void => {
    const profilePanel = panelItems.find((item) => item.appRailId === "profile");
    navigate(getDashboardPathForPanel(profilePanel?.id ?? "", currentUser?.role));
  };

  const onCancelProfilePrompt = (): void => {
    setDismissedProfilePromptForUserId(currentUser?._id ?? null);
  };

  const onOpenProfileForm = (): void => {
    setIsProfileFormOpen(true);
  };

  const onCancelProfileForm = (): void => {
    setIsProfileFormOpen(false);
  };

  const onSubmitProfile = async (payload: CompleteProfilePayload): Promise<void> => {
    try {
      const response = await completeProfileMutation(payload).unwrap();
      if (response.data) {
        dispatch(setCurrentUser(response.data));
      }
      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: response.message || DASHBOARD_MESSAGES.PROFILE_COMPLETED_SUCCESS,
      });
      setIsProfileFormOpen(false);
      setDismissedProfilePromptForUserId(null);
    } catch (error) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: getDashboardErrorMessage(error, DASHBOARD_MESSAGES.PROFILE_COMPLETED_FAILED),
      });
    }
  };

  const onLogout = async (): Promise<void> => {
    try {
      const response = await logoutMutation().unwrap();
      dispatch(clearCurrentUser());
      dispatch(authApi.util.resetApiState());
      dispatch(candidateApi.util.resetApiState());
      dispatch(jobsApi.util.resetApiState());
      dispatch(chatApi.util.resetApiState());
      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: response.message || DASHBOARD_MESSAGES.LOGOUT_SUCCESS,
      });
      navigate("/auth/login", { replace: true });
    } catch (error) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: getDashboardErrorMessage(error, DASHBOARD_MESSAGES.LOGOUT_FAILED),
      });
    }
  };

  return {
    currentUser,
    isLoggingOut,
    isCompletingProfile,
    panelItems,
    railItems,
    safeActiveAppRailId,
    safeActivePanelId,
    filteredPanelItems,
    totalUnreadChats,
    isHrUser,
    isCandidateUser,
    isProfilePromptOpen,
    isProfileFormOpen,
    profilePromptMessage,
    onAppRailChange,
    onLeftPanelChange,
    onOpenProfile,
    onCancelProfilePrompt,
    onOpenProfileForm,
    onCancelProfileForm,
    onSubmitProfile,
    onLogout,
  };
};
