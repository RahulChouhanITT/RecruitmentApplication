import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from "react";
import { DASHBOARD_EMPTY_STATE_LABELS, DASHBOARD_MESSAGES, DASHBOARD_PROFILE_LABELS } from "../../labels/dashboardLabels";
import { WorkspaceShell } from "../../components/WorkspaceShell/WorkspaceShell";
import { useDashboardPage } from "../../hooks/useDashboardPage";
import { EmptyStateCard } from "../../components/EmptyStateCard/EmptyStateCard";
import { FiCalendar, FiLayers, FiMessageCircle } from "react-icons/fi";
import {
  DashboardContentCard,
  DashboardDescription,
} from "./DashboardPage.styles";
import { AuthModal } from "../../../auth/components/AuthModal/AuthModal";

const PendingApprovalsPanel = lazy(async () => {
  const module = await import("../../../hr/components/PendingApprovalsPanel/PendingApprovalsPanel");
  return { default: module.PendingApprovalsPanel };
});

const InterviewSchedulePanel = lazy(async () => {
  const module = await import("../../../hr/components/InterviewSchedulePanel/InterviewSchedulePanel");
  return { default: module.InterviewSchedulePanel };
});

const InterviewerInterviewsPage = lazy(async () => {
  const module = await import("../../../interviewer/pages/InterviewerInterviewsPage/InterviewerInterviewsPage");
  return { default: module.InterviewerInterviewsPage };
});

const ChatThreadsPanel = lazy(async () => {
  const module = await import("../../components/ChatThreadsPanel/ChatThreadsPanel");
  return { default: module.ChatThreadsPanel };
});

const JobsPanel = lazy(async () => {
  const module = await import("../../../jobs/components/JobsPanel/JobsPanel");
  return { default: module.JobsPanel };
});

const OpenJobsPage = lazy(async () => {
  const module = await import("../../../jobs/pages/OpenJobsPage/OpenJobsPage");
  return { default: module.OpenJobsPage };
});

const MyApplicationsPage = lazy(async () => {
  const module = await import("../../../jobs/pages/MyApplicationsPage/MyApplicationsPage");
  return { default: module.MyApplicationsPage };
});

const InterviewsPage = lazy(async () => {
  const module = await import("../../../jobs/pages/InterviewsPage/InterviewsPage");
  return { default: module.InterviewsPage };
});

const ProfilePanel = lazy(async () => {
  const module = await import("../../../profile/pages/ProfilePanel/ProfilePanel");
  return { default: module.ProfilePanel };
});

const ProfileCompletionModal = lazy(async () => {
  const module = await import("../../../profile/components/ProfileCompletionModal/ProfileCompletionModal");
  return { default: module.ProfileCompletionModal };
});

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

  const renderLazyModule = (node: ReactNode) => (
    <Suspense fallback={<DashboardDescription>{DASHBOARD_MESSAGES.LOADING_MODULE}</DashboardDescription>}>
      {node}
    </Suspense>
  );

  const renderModuleContent = () => {
    if (safeActiveAppRailId === "chat") {
      return renderLazyModule(<ChatThreadsPanel hideConversationList forcedConversationId={safeActivePanelId} />);
    }

    switch (safeActivePanelId) {
      case "hr-pending":
        return renderLazyModule(<PendingApprovalsPanel isActive />);
      case "hr-jobs-manage":
      case "hr-jobs-applications":
        return renderLazyModule(<JobsPanel role={currentUser?.role} activePanelId={safeActivePanelId} />);
      case "can-open-jobs":
        return renderLazyModule(<OpenJobsPage />);
      case "can-my-applications":
        return renderLazyModule(<MyApplicationsPage />);
      case "can-my-interviews":
        return renderLazyModule(<InterviewsPage initialView="both" />);
      case "hr-schedule":
        return renderLazyModule(<InterviewSchedulePanel />);
      case "int-my-interviews":
        return renderLazyModule(<InterviewerInterviewsPage initialView="both" />);
      case "hr-profile":
      case "int-profile":
      case "can-profile":
        return renderLazyModule(<ProfilePanel />);
      default:
        break;
    }

    if (safeActiveAppRailId === "profile") {
      return renderLazyModule(<ProfilePanel />);
    }

    if (isHrUser && safeActiveAppRailId === "pending-request") {
      return renderLazyModule(<PendingApprovalsPanel isActive />);
    }

    if (safeActiveAppRailId === "jobs") {
      if (isCandidateUser) {
        return renderLazyModule(<OpenJobsPage />);
      }
      return renderLazyModule(<JobsPanel role={currentUser?.role} activePanelId={safeActivePanelId} />);
    }

    if (safeActiveAppRailId === "interviews") {
      if (isCandidateUser) {
        return renderLazyModule(<InterviewsPage initialView="both" />);
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
        return renderLazyModule(<InterviewSchedulePanel />);
      }
      if (currentUser?.role === "interviewer") {
        return renderLazyModule(<InterviewerInterviewsPage initialView="both" />);
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

      <Suspense fallback={null}>
        <ProfileCompletionModal
          isOpen={isProfileFormOpen}
          role={currentUser?.role}
          isSubmitting={isCompletingProfile}
          onCancel={onCancelProfileForm}
          onSubmit={onSubmitProfile}
        />
      </Suspense>
    </WorkspaceShell>
  );
};
