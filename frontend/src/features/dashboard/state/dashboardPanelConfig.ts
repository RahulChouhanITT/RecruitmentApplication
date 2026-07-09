import type { AuthRole } from '../../auth/types';
import type { LeftPanelItemData } from '../types/dashboardShellTypes';

const HR_PANEL_ITEMS: ReadonlyArray<LeftPanelItemData> = [
  {
    id: 'hr-chats',
    title: 'Chats',
    subtitle: 'Communicate with candidates and interviewers',
    appRailId: 'chat',
  },
  {
    id: 'hr-notifications',
    title: 'Notifications',
    subtitle: 'Application, interview, and status updates',
    appRailId: 'notifications',
  },
  {
    id: 'hr-pending',
    title: 'Pending Requests',
    subtitle: 'Approvals and pending action items',
    appRailId: 'pending-request',
  },
  {
    id: 'hr-jobs-manage',
    title: 'Create & Manage Jobs',
    subtitle: 'Create new jobs and update existing postings',
    appRailId: 'jobs',
  },
  {
    id: 'hr-jobs-applications',
    title: 'Applications',
    subtitle: 'View job applications and candidate status',
    appRailId: 'jobs',
  },
  {
    id: 'hr-schedule',
    title: 'Interview List',
    subtitle: 'View feedback and change application status',
    appRailId: 'schedule-interview',
  },
  {
    id: 'hr-profile',
    title: 'My Profile',
    subtitle: 'View and manage your profile information',
    appRailId: 'profile',
  },
];

const INTERVIEWER_PANEL_ITEMS: ReadonlyArray<LeftPanelItemData> = [
  {
    id: 'int-notifications',
    title: 'Notifications',
    subtitle: 'Assignment and status updates',
    appRailId: 'notifications',
  },
  {
    id: 'int-my-interviews',
    title: 'My Interviews',
    subtitle: 'View upcoming and completed interviews',
    appRailId: 'schedule',
  },
  {
    id: 'int-chats',
    title: 'Chats',
    subtitle: 'Coordinate with HR and candidates',
    appRailId: 'chat',
  },
  {
    id: 'int-profile',
    title: 'My Profile',
    subtitle: 'View and manage your profile information',
    appRailId: 'profile',
  },
];

const CANDIDATE_PANEL_ITEMS: ReadonlyArray<LeftPanelItemData> = [
  {
    id: 'can-notifications',
    title: 'Notifications',
    subtitle: 'Application and interview updates',
    appRailId: 'notifications',
  },
  {
    id: 'can-open-jobs',
    title: 'Open Jobs',
    subtitle: 'Available jobs matching your profile',
    appRailId: 'jobs',
  },
  {
    id: 'can-my-applications',
    title: 'My Applications',
    subtitle: 'Track applied jobs and progress',
    appRailId: 'jobs',
  },
  {
    id: 'can-my-interviews',
    title: 'My Interviews',
    subtitle: 'View upcoming and completed interviews',
    appRailId: 'interviews',
  },
  {
    id: 'can-chat',
    title: 'Chats',
    subtitle: 'Connect with HR and interviewer',
    appRailId: 'chat',
  },
  {
    id: 'can-profile',
    title: 'My Profile',
    subtitle: 'View and manage your profile information',
    appRailId: 'profile',
  },
];

const PANEL_ITEMS_BY_ROLE: Record<'hr' | 'interviewer' | 'candidate', ReadonlyArray<LeftPanelItemData>> = {
  hr: HR_PANEL_ITEMS,
  interviewer: INTERVIEWER_PANEL_ITEMS,
  candidate: CANDIDATE_PANEL_ITEMS,
};

export const getRolePanelItems = (role: AuthRole | undefined): LeftPanelItemData[] => {
  if (role === 'hr') {
    return [...PANEL_ITEMS_BY_ROLE.hr];
  }
  if (role === 'interviewer') {
    return [...PANEL_ITEMS_BY_ROLE.interviewer];
  }
  return [...PANEL_ITEMS_BY_ROLE.candidate];
};

export const getDefaultPanelIdForRole = (role: AuthRole | undefined): string => {
  if (role === 'hr') {
    return 'hr-chats';
  }
  if (role === 'interviewer') {
    return 'int-chats';
  }
  return 'can-chat';
};
