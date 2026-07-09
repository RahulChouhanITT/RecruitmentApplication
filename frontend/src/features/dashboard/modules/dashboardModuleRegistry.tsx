import { lazy, type ReactNode } from 'react';
import { FiCalendar, FiLayers, FiMessageCircle } from 'react-icons/fi';
import { EmptyStateCard } from '../components/EmptyStateCard';
import { DASHBOARD_EMPTY_STATE_LABELS } from '../labels/dashboardLabels';
import type { AuthUser } from '../../auth/types';

const PendingApprovalsPanel = lazy(async () => {
  const module = await import('../../hr/components/PendingApprovalsPanel/index');
  return { default: module.PendingApprovalsPanel };
});

const InterviewSchedulePanel = lazy(async () => {
  const module = await import('../../hr/components/InterviewSchedulePanel/index');
  return { default: module.InterviewSchedulePanel };
});

const InterviewerInterviewsPage = lazy(async () => {
  const module = await import('../../interviewer/pages/InterviewerInterviewsPage/InterviewerInterviewsPage');
  return { default: module.InterviewerInterviewsPage };
});

const ChatThreadsPanel = lazy(async () => {
  const module = await import('../../chat/components/ChatThreadsPanel/index');
  return { default: module.ChatThreadsPanel };
});

const HrJobsManagementPanel = lazy(async () => {
  const module = await import('../../jobs/components/HrJobsManagementPanel/index');
  return { default: module.HrJobsManagementPanel };
});

const HrJobApplicationsPanel = lazy(async () => {
  const module = await import('../../jobs/components/HrJobApplicationsPanel/index');
  return { default: module.HrJobApplicationsPanel };
});

const CandidateJobsBoard = lazy(async () => {
  const module = await import('../../jobs/components/CandidateJobsBoard/index');
  return { default: module.CandidateJobsBoard };
});

const OpenJobsPage = lazy(async () => {
  const module = await import('../../jobs/pages/OpenJobsPage/OpenJobsPage');
  return { default: module.OpenJobsPage };
});

const MyApplicationsPage = lazy(async () => {
  const module = await import('../../jobs/pages/MyApplicationsPage/MyApplicationsPage');
  return { default: module.MyApplicationsPage };
});

const InterviewsPage = lazy(async () => {
  const module = await import('../../jobs/pages/InterviewsPage/InterviewsPage');
  return { default: module.InterviewsPage };
});

const ProfilePanel = lazy(async () => {
  const module = await import('../../profile/pages/ProfilePanel/ProfilePanel');
  return { default: module.ProfilePanel };
});

const NotificationPanel = lazy(async () => {
  const module = await import('../../notifications/components/NotificationPanel/index');
  return { default: module.NotificationPanel };
});

const emptyState = (icon: typeof FiMessageCircle, title: string, description: string): ReactNode => (
  <EmptyStateCard icon={icon} title={title} description={description} />
);

type ResolveDashboardModuleParams = {
  currentUser?: AuthUser | null;
  safeActiveAppRailId: string;
  safeActivePanelId: string;
  isHrUser: boolean;
  isCandidateUser: boolean;
};

export const resolveDashboardModule = ({
  currentUser,
  safeActiveAppRailId,
  safeActivePanelId,
  isHrUser,
  isCandidateUser,
}: ResolveDashboardModuleParams): ReactNode => {
  if (safeActiveAppRailId === 'chat') {
    return <ChatThreadsPanel hideConversationList forcedConversationId={safeActivePanelId} />;
  }

  switch (safeActivePanelId) {
    case 'hr-pending':
      return <PendingApprovalsPanel isActive />;
    case 'hr-notifications':
    case 'int-notifications':
    case 'can-notifications':
      return <NotificationPanel />;
    case 'hr-jobs-manage':
      return <HrJobsManagementPanel />;
    case 'hr-jobs-applications':
      return <HrJobApplicationsPanel />;
    case 'can-open-jobs':
      return <OpenJobsPage />;
    case 'can-my-applications':
      return <MyApplicationsPage />;
    case 'can-my-interviews':
      return <InterviewsPage initialView="both" />;
    case 'hr-schedule':
      return <InterviewSchedulePanel />;
    case 'int-my-interviews':
      return <InterviewerInterviewsPage initialView="both" />;
    case 'hr-profile':
    case 'int-profile':
    case 'can-profile':
      return <ProfilePanel />;
    default:
      break;
  }

  if (safeActiveAppRailId === 'profile') {
    return <ProfilePanel />;
  }

  if (safeActiveAppRailId === 'notifications') {
    return <NotificationPanel />;
  }

  if (isHrUser && safeActiveAppRailId === 'pending-request') {
    return <PendingApprovalsPanel isActive />;
  }

  if (safeActiveAppRailId === 'jobs') {
    return isCandidateUser ? <CandidateJobsBoard /> : <HrJobsManagementPanel />;
  }

  if (safeActiveAppRailId === 'interviews') {
    return isCandidateUser
      ? <InterviewsPage initialView="both" />
      : emptyState(
          FiCalendar,
          DASHBOARD_EMPTY_STATE_LABELS.NO_INTERVIEWS_TITLE,
          DASHBOARD_EMPTY_STATE_LABELS.NO_INTERVIEWS_DESCRIPTION,
        );
  }

  if (safeActiveAppRailId === 'schedule-interview' || safeActiveAppRailId === 'schedule') {
    if (isHrUser) {
      return <InterviewSchedulePanel />;
    }

    if (currentUser?.role === 'interviewer') {
      return <InterviewerInterviewsPage initialView="both" />;
    }

    return emptyState(
      FiCalendar,
      DASHBOARD_EMPTY_STATE_LABELS.NO_SCHEDULED_INTERVIEWS_TITLE,
      DASHBOARD_EMPTY_STATE_LABELS.NO_SCHEDULED_INTERVIEWS_DESCRIPTION,
    );
  }

  if (safeActiveAppRailId === 'assigned' || safeActiveAppRailId === 'feedback') {
    return emptyState(
      FiLayers,
      DASHBOARD_EMPTY_STATE_LABELS.NO_DATA_TITLE,
      DASHBOARD_EMPTY_STATE_LABELS.NO_DATA_DESCRIPTION,
    );
  }

  return emptyState(
    FiMessageCircle,
    DASHBOARD_EMPTY_STATE_LABELS.SELECT_SECTION_TITLE,
    DASHBOARD_EMPTY_STATE_LABELS.SELECT_SECTION_DESCRIPTION,
  );
};
