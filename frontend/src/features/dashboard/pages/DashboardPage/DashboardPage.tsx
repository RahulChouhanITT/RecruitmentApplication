import { Component, type ErrorInfo, type ReactNode } from "react";
import { DASHBOARD_EMPTY_STATE_LABELS, DASHBOARD_MESSAGES, DASHBOARD_PROFILE_LABELS } from "../../labels/dashboardLabels";
import { WorkspaceShell } from "../../components/WorkspaceShell/WorkspaceShell";
import { useDashboardPage } from "../../hooks/useDashboardPage";
import { PendingApprovalsPanel } from "../../../hr/components/PendingApprovalsPanel/PendingApprovalsPanel";
import { InterviewSchedulePanel } from "../../../hr/components/InterviewSchedulePanel/InterviewSchedulePanel";
import { InterviewerInterviewsPage } from "../../../interviewer/pages/InterviewerInterviewsPage/InterviewerInterviewsPage";
import { ChatThreadsPanel } from "../../components/ChatThreadsPanel/ChatThreadsPanel";
import { JobsPanel } from "../../../jobs/components/JobsPanel/JobsPanel";
import { OpenJobsPage } from "../../../jobs/pages/OpenJobsPage/OpenJobsPage";
import { MyApplicationsPage } from "../../../jobs/pages/MyApplicationsPage/MyApplicationsPage";
import { InterviewsPage } from "../../../jobs/pages/InterviewsPage/InterviewsPage";
import { ProfilePanel } from "../../../profile/pages/ProfilePanel/ProfilePanel";
import { EmptyStateCard } from "../../components/EmptyStateCard/EmptyStateCard";
import { FiCalendar, FiLayers, FiMessageCircle } from "react-icons/fi";
import {
  DashboardContentCard,
  DashboardDescription,
} from "./DashboardPage.styles";
import { AuthModal } from "../../../auth/components/AuthModal/AuthModal";
import { ProfileCompletionModal } from "../../../profile/components/ProfileCompletionModal/ProfileCompletionModal";

type ModuleErrorBoundaryProps = {
  children: ReactNode;
  resetKey: string;
};

type ModuleErrorBoundaryState = {
  hasError: boolean;
};

class ModuleErrorBoundary extends Component<ModuleErrorBoundaryProps, ModuleErrorBoundaryState> {
  constructor(props: ModuleErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ModuleErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo): void {
    console.error("Dashboard module render error", error, errorInfo);
  }

  componentDidUpdate(prevProps: ModuleErrorBoundaryProps): void {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return <DashboardDescription>{DASHBOARD_MESSAGES.MODULE_RENDER_ERROR}</DashboardDescription>;
    }

    return this.props.children;
  }
}

export const DashboardPage = () => {
  const {
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
  } = useDashboardPage();

  const renderModuleContent = () => {
    if (safeActiveAppRailId === "chat") {
      return <ChatThreadsPanel hideConversationList forcedConversationId={safeActivePanelId} />;
    }

    switch (safeActivePanelId) {
      case "hr-pending":
        return <PendingApprovalsPanel isActive />;
      case "hr-jobs-manage":
      case "hr-jobs-applications":
        return <JobsPanel role={currentUser?.role} activePanelId={safeActivePanelId} />;
      case "can-open-jobs":
        return <OpenJobsPage />;
      case "can-my-applications":
        return <MyApplicationsPage />;
      case "can-my-interviews":
        return <InterviewsPage initialView="both" />;
      case "hr-schedule":
        return <InterviewSchedulePanel />;
      case "int-my-interviews":
        return <InterviewerInterviewsPage initialView="both" />;
      case "hr-profile":
      case "int-profile":
      case "can-profile":
        return <ProfilePanel />;
      default:
        break;
    }

    if (safeActiveAppRailId === "profile") {
      return <ProfilePanel />;
    }

    if (isHrUser && safeActiveAppRailId === "pending-request") {
      return <PendingApprovalsPanel isActive />;
    }

    if (safeActiveAppRailId === "jobs") {
      if (isCandidateUser) {
        return <OpenJobsPage />;
      }
      return <JobsPanel role={currentUser?.role} activePanelId={safeActivePanelId} />;
    }

    if (safeActiveAppRailId === "interviews") {
      if (isCandidateUser) {
        return <InterviewsPage initialView="both" />;
      }
      return (
        <EmptyStateCard
          icon={FiCalendar}
          title={DASHBOARD_EMPTY_STATE_LABELS.NO_INTERVIEWS_TITLE}
          description={DASHBOARD_EMPTY_STATE_LABELS.NO_INTERVIEWS_DESCRIPTION}
        />
      );
    }

    if (safeActiveAppRailId === "schedule-interview" || safeActiveAppRailId === "schedule") {
      if (isHrUser) {
        return <InterviewSchedulePanel />;
      }
      if (currentUser?.role === "interviewer") {
        return <InterviewerInterviewsPage initialView="both" />;
      }
      return (
        <EmptyStateCard
          icon={FiCalendar}
          title={DASHBOARD_EMPTY_STATE_LABELS.NO_SCHEDULED_INTERVIEWS_TITLE}
          description={DASHBOARD_EMPTY_STATE_LABELS.NO_SCHEDULED_INTERVIEWS_DESCRIPTION}
        />
      );
    }

    if (safeActiveAppRailId === "assigned" || safeActiveAppRailId === "feedback") {
      return (
        <EmptyStateCard
          icon={FiLayers}
          title={DASHBOARD_EMPTY_STATE_LABELS.NO_DATA_TITLE}
          description={DASHBOARD_EMPTY_STATE_LABELS.NO_DATA_DESCRIPTION}
        />
      );
    }

    return (
      <EmptyStateCard
        icon={FiMessageCircle}
        title={DASHBOARD_EMPTY_STATE_LABELS.SELECT_SECTION_TITLE}
        description={DASHBOARD_EMPTY_STATE_LABELS.SELECT_SECTION_DESCRIPTION}
      />
    );
  };

  return (
    <WorkspaceShell
      onLogout={onLogout}
      isLoggingOut={isLoggingOut}
      totalUnreadChats={totalUnreadChats}
      leftPanelWidth={340}
      leftPanelItems={filteredPanelItems}
      appRailItems={railItems}
      activeLeftPanelId={safeActivePanelId}
      onLeftPanelChange={onLeftPanelChange}
      activeAppRailId={safeActiveAppRailId}
      onAppRailChange={onAppRailChange}
      onProfileClick={onOpenProfile}
    >
      <DashboardContentCard>
        <ModuleErrorBoundary resetKey={`${safeActiveAppRailId}-${safeActivePanelId}`}>
          {renderModuleContent()}
        </ModuleErrorBoundary>
      </DashboardContentCard>

      <AuthModal
        isOpen={isProfilePromptOpen}
        title={DASHBOARD_PROFILE_LABELS.COMPLETE_PROFILE_TITLE}
        message={profilePromptMessage}
        closeLabel={DASHBOARD_PROFILE_LABELS.COMPLETE_PROFILE_CLOSE}
        onClose={onCancelProfilePrompt}
        primaryLabel={DASHBOARD_PROFILE_LABELS.COMPLETE_PROFILE_PRIMARY}
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
