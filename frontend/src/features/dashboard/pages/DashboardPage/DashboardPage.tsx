import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from 'react';
import {
  DASHBOARD_MESSAGES,
  DASHBOARD_PROFILE_LABELS,
} from '../../labels/dashboardLabels';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useDashboardPage } from '../../hooks/useDashboardPage';
import { resolveDashboardModule } from '../../modules/dashboardModuleRegistry';
import { DashboardContentCard, DashboardDescription } from './DashboardPage.styles';
import { AuthModal } from '../../../auth/components/AuthModal';
const ProfileCompletionModal = lazy(async () => {
  const module = await import('../../../profile/components/ProfileCompletionModal');
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
    console.error('Dashboard module render error', error, errorInfo);
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
  } = useDashboardPage();
  const isChatView = safeActiveAppRailId === 'chat';

  const renderLazyModule = (node: ReactNode) => (
    <Suspense
      fallback={<DashboardDescription>{DASHBOARD_MESSAGES.LOADING_MODULE}</DashboardDescription>}
    >
      {node}
    </Suspense>
  );

  const renderModuleContent = () =>
    renderLazyModule(
      resolveDashboardModule({
        currentUser,
        safeActiveAppRailId,
        safeActivePanelId,
        isHrUser,
        isCandidateUser,
      }),
    );

  return (
    <WorkspaceShell
      onLogout={onRequestLogout}
      isLoggingOut={isLoggingOut}
      totalUnreadChats={totalUnreadChats}
      totalUnreadNotifications={totalUnreadNotifications}
      flushContent={isChatView}
      leftPanelWidth={340}
      leftPanelItems={filteredPanelItems}
      appRailItems={railItems}
      activeLeftPanelId={safeActivePanelId}
      onLeftPanelChange={onLeftPanelChange}
      activeAppRailId={safeActiveAppRailId}
      onAppRailChange={onAppRailChange}
      onProfileClick={onOpenProfile}
    >
      <DashboardContentCard $fullBleed={isChatView}>
        <ModuleErrorBoundary resetKey={`${safeActiveAppRailId}-${safeActivePanelId}`}>
          {renderModuleContent()}
        </ModuleErrorBoundary>
      </DashboardContentCard>

      <AuthModal
        isOpen={isLogoutConfirmOpen}
        title={DASHBOARD_MESSAGES.LOGOUT_CONFIRM_TITLE}
        message={DASHBOARD_MESSAGES.LOGOUT_CONFIRM_MESSAGE}
        closeLabel={DASHBOARD_MESSAGES.LOGOUT_CANCEL_ACTION}
        onClose={onCancelLogout}
        primaryLabel={
          isLoggingOut ? DASHBOARD_MESSAGES.LOGGING_OUT : DASHBOARD_MESSAGES.LOGOUT_CONFIRM_ACTION
        }
        onPrimaryAction={onConfirmLogout}
      />

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
