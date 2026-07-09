import type { AuthRole } from '../../auth/types';
import { getDefaultPanelIdForRole, getRolePanelItems } from './dashboardPanelConfig';
import { getRoleRailItems } from './dashboardRailConfig';

const PANEL_PATHS: Record<string, string> = {
  'hr-chats': '/dashboard/chats',
  'int-chats': '/dashboard/chats',
  'can-chat': '/dashboard/chats',
  'hr-pending': '/dashboard/pending',
  'hr-notifications': '/dashboard/notifications',
  'int-notifications': '/dashboard/notifications',
  'can-notifications': '/dashboard/notifications',
  'hr-jobs-manage': '/dashboard/jobs/manage',
  'hr-jobs-applications': '/dashboard/jobs/applications',
  'can-open-jobs': '/dashboard/jobs',
  'can-my-applications': '/dashboard/my-applications',
  'hr-schedule': '/dashboard/interviews',
  'int-my-interviews': '/dashboard/my-interviews',
  'can-my-interviews': '/dashboard/my-interviews',
  'hr-profile': '/dashboard/profile',
  'int-profile': '/dashboard/profile',
  'can-profile': '/dashboard/profile',
};

export type DashboardSelection = {
  railId: string;
  panelId: string;
  isValid: boolean;
};

export const getDashboardPathForPanel = (panelId: string, role: AuthRole | undefined): string => {
  return (
    PANEL_PATHS[panelId] ??
    getDashboardPathForPanel(getDefaultPanelIdForRole(role), role)
  );
};

export const getDashboardPathForRail = (railId: string, role: AuthRole | undefined): string => {
  if (railId === 'chat') {
    return '/dashboard/chats';
  }

  if (railId === 'pending-request') {
    return '/dashboard/pending';
  }

  if (railId === 'notifications') {
    return '/dashboard/notifications';
  }

  if (railId === 'jobs') {
    return role === 'hr'
      ? '/dashboard/jobs/manage'
      : role === 'candidate'
        ? '/dashboard/jobs'
        : '/dashboard/chats';
  }

  if (railId === 'schedule-interview' || railId === 'schedule' || railId === 'interviews') {
    return '/dashboard/interviews';
  }

  if (railId === 'profile') {
    return '/dashboard/profile';
  }

  return getDashboardPathForPanel(getDefaultPanelIdForRole(role), role);
};

export const resolveDashboardSelection = (
  pathname: string,
  role: AuthRole | undefined,
  fallbackPanelId?: string,
): DashboardSelection => {
  const normalizedPath = pathname.replace(/\/+$/, '');
  const relativePath = normalizedPath.startsWith('/dashboard')
    ? normalizedPath.slice('/dashboard'.length)
    : normalizedPath;
  const [section = '', subSection = ''] = relativePath.split('/').filter(Boolean);

  if (section === 'chats') {
    return { railId: 'chat', panelId: subSection || '', isValid: true };
  }

  if (section === 'pending' && role === 'hr') {
    return { railId: 'pending-request', panelId: 'hr-pending', isValid: true };
  }

  if (section === 'notifications') {
    if (role === 'hr') {
      return { railId: 'notifications', panelId: 'hr-notifications', isValid: !subSection };
    }
    if (role === 'interviewer') {
      return { railId: 'notifications', panelId: 'int-notifications', isValid: !subSection };
    }
    return { railId: 'notifications', panelId: 'can-notifications', isValid: !subSection };
  }

  if (section === 'jobs' && role === 'hr') {
    if (subSection === 'applications') {
      return { railId: 'jobs', panelId: 'hr-jobs-applications', isValid: true };
    }
    if (subSection === '' || subSection === 'manage') {
      return { railId: 'jobs', panelId: 'hr-jobs-manage', isValid: true };
    }
    return { railId: 'jobs', panelId: 'hr-jobs-manage', isValid: false };
  }

  if (section === 'jobs') {
    if (subSection) {
      return { railId: 'jobs', panelId: 'can-open-jobs', isValid: false };
    }
    return { railId: 'jobs', panelId: 'can-open-jobs', isValid: true };
  }

  if (section === 'applications') {
    if (role === 'hr') {
      return { railId: 'jobs', panelId: 'hr-jobs-applications', isValid: true };
    }
    if (subSection) {
      return { railId: 'jobs', panelId: 'can-my-applications', isValid: false };
    }
    return { railId: 'jobs', panelId: 'can-my-applications', isValid: true };
  }

  if (section === 'my-applications') {
    return { railId: 'jobs', panelId: 'can-my-applications', isValid: !subSection };
  }

  if (section === 'interviews') {
    if (role === 'hr') {
      return { railId: 'schedule-interview', panelId: 'hr-schedule', isValid: !subSection };
    }
    if (role === 'interviewer') {
      return { railId: 'schedule', panelId: 'int-my-interviews', isValid: !subSection };
    }
    return { railId: 'interviews', panelId: 'can-my-interviews', isValid: !subSection };
  }

  if (section === 'my-interviews') {
    if (role === 'hr') {
      return { railId: 'schedule-interview', panelId: 'hr-schedule', isValid: false };
    }
    if (role === 'interviewer') {
      return { railId: 'schedule', panelId: 'int-my-interviews', isValid: !subSection };
    }
    return { railId: 'interviews', panelId: 'can-my-interviews', isValid: !subSection };
  }

  if (section === 'profile') {
    if (role === 'hr') {
      return { railId: 'profile', panelId: 'hr-profile', isValid: !subSection };
    }
    if (role === 'interviewer') {
      return { railId: 'profile', panelId: 'int-profile', isValid: !subSection };
    }
    return { railId: 'profile', panelId: 'can-profile', isValid: !subSection };
  }

  const defaultPanelId = fallbackPanelId ?? getDefaultPanelIdForRole(role);
  return {
    railId:
      getRolePanelItems(role).find((item) => item.id === defaultPanelId)?.appRailId ??
      getRoleRailItems(role)[0]?.id ??
      'chat',
    panelId: defaultPanelId,
    isValid: section === '',
  };
};
