import {
  FiBriefcase,
  FiCalendar,
  FiCheckSquare,
  FiClipboard,
  FiClock,
  FiMessageSquare,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import type { AuthRole } from "../../auth/types";
import type { LeftPanelItemData, LeftRailItem } from "../components/WorkspaceShell/WorkspaceShell";

const HR_RAIL_ITEMS: LeftRailItem[] = [
  { id: "chat", label: "Chats", icon: <FiMessageSquare size={18} /> },
  { id: "pending-request", label: "Pending", icon: <FiClock size={18} /> },
  { id: "jobs", label: "Jobs", icon: <FiBriefcase size={18} /> },
  { id: "schedule-interview", label: "Schedule", icon: <FiCalendar size={18} /> },
];

const INTERVIEWER_RAIL_ITEMS: LeftRailItem[] = [
  { id: "chat", label: "Chats", icon: <FiMessageSquare size={18} /> },
  { id: "assigned", label: "Assigned", icon: <FiUsers size={18} /> },
  { id: "schedule", label: "Schedule", icon: <FiCalendar size={18} /> },
  { id: "feedback", label: "Feedback", icon: <FiCheckSquare size={18} /> },
];

const CANDIDATE_RAIL_ITEMS: LeftRailItem[] = [
  { id: "chat", label: "Chats", icon: <FiMessageSquare size={18} /> },
  { id: "jobs", label: "Jobs", icon: <FiBriefcase size={18} /> },
  { id: "applications", label: "Applied", icon: <FiClipboard size={18} /> },
  { id: "profile", label: "Profile", icon: <FiUser size={18} /> },
];

const HR_PANEL_ITEMS: LeftPanelItemData[] = [
  { id: "hr-chats", title: "Chats", subtitle: "Communicate with candidates and interviewers", appRailId: "chat" },
  {
    id: "hr-pending",
    title: "Pending Requests",
    subtitle: "Approvals and pending action items",
    appRailId: "pending-request",
  },
  { id: "hr-jobs", title: "Jobs", subtitle: "Create and manage job postings", appRailId: "jobs" },
  {
    id: "hr-schedule",
    title: "Schedule Interview",
    subtitle: "Plan rounds and assign interviewers",
    appRailId: "schedule-interview",
  },
  { id: "hr-candidates", title: "Candidates", subtitle: "Track candidate pipeline by stage", appRailId: "jobs" },
  {
    id: "hr-applications",
    title: "Applications",
    subtitle: "Application-wise status and progress",
    appRailId: "jobs",
  },
];

const INTERVIEWER_PANEL_ITEMS: LeftPanelItemData[] = [
  {
    id: "int-assigned",
    title: "Assigned Interviews",
    subtitle: "Round-wise interviews assigned to you",
    appRailId: "assigned",
  },
  { id: "int-schedule", title: "My Schedule", subtitle: "Upcoming interviews and slots", appRailId: "schedule" },
  { id: "int-feedback", title: "Feedback", subtitle: "Submit pass or fail with comments", appRailId: "feedback" },
  { id: "int-chats", title: "Chats", subtitle: "Coordinate with HR and candidates", appRailId: "chat" },
];

const CANDIDATE_PANEL_ITEMS: LeftPanelItemData[] = [
  { id: "can-jobs", title: "Job Openings", subtitle: "Available jobs matching your profile", appRailId: "jobs" },
  {
    id: "can-applications",
    title: "My Applications",
    subtitle: "Track applied jobs and progress",
    appRailId: "applications",
  },
  {
    id: "can-rounds",
    title: "Round Progress",
    subtitle: "View interview round status updates",
    appRailId: "applications",
  },
  {
    id: "can-interviews",
    title: "Upcoming Interviews",
    subtitle: "Interview schedule and notifications",
    appRailId: "applications",
  },
  { id: "can-chat", title: "Chats", subtitle: "Connect with HR and interviewer", appRailId: "chat" },
];

export const getRoleRailItems = (role: AuthRole | undefined): LeftRailItem[] => {
  if (role === "hr") {
    return HR_RAIL_ITEMS;
  }
  if (role === "interviewer") {
    return INTERVIEWER_RAIL_ITEMS;
  }
  return CANDIDATE_RAIL_ITEMS;
};

export const getRolePanelItems = (role: AuthRole | undefined): LeftPanelItemData[] => {
  if (role === "hr") {
    return HR_PANEL_ITEMS;
  }
  if (role === "interviewer") {
    return INTERVIEWER_PANEL_ITEMS;
  }
  return CANDIDATE_PANEL_ITEMS;
};
