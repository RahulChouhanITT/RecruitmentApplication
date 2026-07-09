import { FiBell, FiBriefcase, FiCalendar, FiClock, FiMessageSquare, FiUser } from 'react-icons/fi';
import type { AuthRole } from '../../auth/types';
import type { LeftRailItem } from '../types/dashboardShellTypes';

const HR_RAIL_ITEMS: ReadonlyArray<LeftRailItem> = [
  { id: 'chat', label: 'Chats', icon: <FiMessageSquare size={18} /> },
  { id: 'notifications', label: 'Alerts', icon: <FiBell size={18} /> },
  { id: 'pending-request', label: 'Pending', icon: <FiClock size={18} /> },
  { id: 'jobs', label: 'Jobs', icon: <FiBriefcase size={18} /> },
  { id: 'schedule-interview', label: 'Interviews', icon: <FiCalendar size={18} /> },
  { id: 'profile', label: 'Profile', icon: <FiUser size={18} /> },
];

const INTERVIEWER_RAIL_ITEMS: ReadonlyArray<LeftRailItem> = [
  { id: 'chat', label: 'Chats', icon: <FiMessageSquare size={18} /> },
  { id: 'notifications', label: 'Alerts', icon: <FiBell size={18} /> },
  { id: 'schedule', label: 'Interviews', icon: <FiCalendar size={18} /> },
  { id: 'profile', label: 'Profile', icon: <FiUser size={18} /> },
];

const CANDIDATE_RAIL_ITEMS: ReadonlyArray<LeftRailItem> = [
  { id: 'chat', label: 'Chats', icon: <FiMessageSquare size={18} /> },
  { id: 'notifications', label: 'Alerts', icon: <FiBell size={18} /> },
  { id: 'jobs', label: 'Jobs', icon: <FiBriefcase size={18} /> },
  { id: 'interviews', label: 'Interviews', icon: <FiCalendar size={18} /> },
  { id: 'profile', label: 'Profile', icon: <FiUser size={18} /> },
];

const RAIL_ITEMS_BY_ROLE: Record<'hr' | 'interviewer' | 'candidate', ReadonlyArray<LeftRailItem>> = {
  hr: HR_RAIL_ITEMS,
  interviewer: INTERVIEWER_RAIL_ITEMS,
  candidate: CANDIDATE_RAIL_ITEMS,
};

export const getRoleRailItems = (role: AuthRole | undefined): LeftRailItem[] => {
  if (role === 'hr') {
    return [...RAIL_ITEMS_BY_ROLE.hr];
  }
  if (role === 'interviewer') {
    return [...RAIL_ITEMS_BY_ROLE.interviewer];
  }
  return [...RAIL_ITEMS_BY_ROLE.candidate];
};
