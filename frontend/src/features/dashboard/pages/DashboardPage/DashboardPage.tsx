import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { showToast, TOAST_TYPES } from "../../../../shared/utils/toast";
import { authApi, useCompleteProfileMutation, useLogoutMutation } from "../../../auth/api/authApi";
import { clearCurrentUser, setCurrentUser } from "../../../auth/state/authSlice";
import { DASHBOARD_MESSAGES } from "../../constants";
import { WorkspaceShell } from "../../components/WorkspaceShell/WorkspaceShell";
import { getRolePanelItems, getRoleRailItems } from "../../config/dashboardNavigation";
import { PendingApprovalsPanel } from "../../../hr/components/PendingApprovalsPanel/PendingApprovalsPanel";
import { ChatThreadsPanel } from "../../components/ChatThreadsPanel/ChatThreadsPanel";
import {
  DashboardContentCard,
  DashboardDescription,
  DashboardHeaderRow,
  DashboardTitle,
  LogoutButton,
} from "./DashboardPage.styles";
import { AuthModal } from "../../../auth/components/AuthModal/AuthModal";
import { ProfileCompletionModal } from "../../../profile/components/ProfileCompletionModal/ProfileCompletionModal";
import type { CompleteProfilePayload } from "../../../auth/types";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [completeProfileMutation, { isLoading: isCompletingProfile }] = useCompleteProfileMutation();
  const panelItems = useMemo(() => getRolePanelItems(currentUser?.role), [currentUser?.role]);
  const railItems = useMemo(() => getRoleRailItems(currentUser?.role), [currentUser?.role]);
  const [activePanelId, setActivePanelId] = useState<string>(panelItems[0]?.id ?? "");
  const [activeAppRailId, setActiveAppRailId] = useState<string>(railItems[0]?.id ?? "");
  const [isProfilePromptOpen, setIsProfilePromptOpen] = useState(false);
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const isHrUser = currentUser?.role === "hr";

  useEffect(() => {
    setActivePanelId(panelItems[0]?.id ?? "");
    setActiveAppRailId(railItems[0]?.id ?? "");
  }, [panelItems, railItems]);

  useEffect(() => {
    if (currentUser && !currentUser.profileCompleted) {
      setIsProfilePromptOpen(true);
    }

    if (currentUser?.profileCompleted) {
      setIsProfilePromptOpen(false);
      setIsProfileFormOpen(false);
    }
  }, [currentUser]);

  const onAppRailChange = (appRailId: string): void => {
    setActiveAppRailId(appRailId);
    const firstMatchedPanel = panelItems.find((item) => item.appRailId === appRailId);
    if (firstMatchedPanel) {
      setActivePanelId(firstMatchedPanel.id);
    }
  };

  const onLeftPanelChange = (panelId: string): void => {
    setActivePanelId(panelId);
    const selectedPanel = panelItems.find((item) => item.id === panelId);
    if (selectedPanel?.appRailId) {
      setActiveAppRailId(selectedPanel.appRailId);
    }
  };

  const renderModuleContent = () => {
    if (activeAppRailId === "chat") {
      return <ChatThreadsPanel />;
    }

    if (isHrUser && activeAppRailId === "pending-request") {
      return <PendingApprovalsPanel isActive />;
    }

    if (activeAppRailId === "jobs") {
      return <DashboardDescription>Jobs module UI will be shown here.</DashboardDescription>;
    }

    if (activeAppRailId === "schedule-interview" || activeAppRailId === "schedule") {
      return <DashboardDescription>Schedule interview module UI will be shown here.</DashboardDescription>;
    }

    if (activeAppRailId === "applications") {
      return <DashboardDescription>Applications module UI will be shown here.</DashboardDescription>;
    }

    if (activeAppRailId === "assigned" || activeAppRailId === "feedback") {
      return <DashboardDescription>Interviewer module UI will be shown here.</DashboardDescription>;
    }

    return <DashboardDescription>Select a module from the left menu.</DashboardDescription>;
  };

  const onCancelProfilePrompt = (): void => {
    setIsProfilePromptOpen(false);
  };

  const onOpenProfileForm = (): void => {
    setIsProfilePromptOpen(false);
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
        message: response.message || "Profile completed successfully",
      });
      setIsProfileFormOpen(false);
      setIsProfilePromptOpen(false);
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : "Failed to complete profile";
      showToast({
        type: TOAST_TYPES.ERROR,
        message,
      });
    }
  };

  const onLogout = async (): Promise<void> => {
    try {

      const response = await logoutMutation().unwrap();
      dispatch(clearCurrentUser());
      dispatch(authApi.util.resetApiState());
      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: response.message || DASHBOARD_MESSAGES.LOGOUT_SUCCESS,
      });
      navigate("/auth/login", { replace: true });
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : DASHBOARD_MESSAGES.LOGOUT_FAILED;
      showToast({
        type: TOAST_TYPES.ERROR,
        message,
      });
    }
  };

  return (
    <WorkspaceShell
      title="Dashboard"
      onLogout={onLogout}
      isLoggingOut={isLoggingOut}
      leftPanelItems={panelItems}
      appRailItems={railItems}
      activeLeftPanelId={activePanelId}
      onLeftPanelChange={onLeftPanelChange}
      activeAppRailId={activeAppRailId}
      onAppRailChange={onAppRailChange}
    >
      <DashboardContentCard>
        <DashboardHeaderRow>
          <DashboardTitle>{DASHBOARD_MESSAGES.TITLE}</DashboardTitle>
          <LogoutButton type="button" onClick={onLogout} disabled={isLoggingOut}>
            {isLoggingOut ? DASHBOARD_MESSAGES.LOGGING_OUT : DASHBOARD_MESSAGES.LOGOUT}
          </LogoutButton>
        </DashboardHeaderRow>
        <DashboardDescription>
          This is the common dashboard layout foundation. We can now plug role-specific modules for
          HR, Interviewer, and Candidate without changing the shell structure.
        </DashboardDescription>
        {renderModuleContent()}
      </DashboardContentCard>

      <AuthModal
        isOpen={isProfilePromptOpen}
        title="Complete Your Profile"
        message="Please complete your profile before continuing."
        closeLabel="Cancel"
        onClose={onCancelProfilePrompt}
        primaryLabel="Complete Profile"
        onPrimaryAction={onOpenProfileForm}
      />

      <ProfileCompletionModal
        isOpen={isProfileFormOpen}
        role={currentUser?.role}
        isSubmitting={isCompletingProfile}
        onCancel={onCancelProfileForm}
        onSubmit={onSubmitProfile}
      />
    </WorkspaceShell>
  );
};
