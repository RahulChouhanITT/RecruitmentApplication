import {
  FiBriefcase,
  FiCalendar,
  FiClock,
  FiMessageSquare,
  FiUser,
} from "react-icons/fi";
import type { AuthRole } from "../../auth/types/authTypes";
import type { LeftPanelItemData, LeftRailItem } from "../components/WorkspaceShell/WorkspaceShell";

type DashboardSelection = {
  railId: string;
  panelId: string;
  isValid: boolean;
};

const HR_RAIL_ITEMS: LeftRailItem[] = [
  { id: "chat", label: "Chats", icon: <FiMessageSquare size={18} /> },
  { id: "pending-request", label: "Pending", icon: <FiClock size={18} /> },
  { id: "jobs", label: "Jobs", icon: <FiBriefcase size={18} /> },
  { id: "schedule-interview", label: "Interviews", icon: <FiCalendar size={18} /> },
  { id: "profile", label: "Profile", icon: <FiUser size={18} /> },
];

const INTERVIEWER_RAIL_ITEMS: LeftRailItem[] = [
  { id: "chat", label: "Chats", icon: <FiMessageSquare size={18} /> },
  { id: "schedule", label: "Interviews", icon: <FiCalendar size={18} /> },
  { id: "profile", label: "Profile", icon: <FiUser size={18} /> },
];

const CANDIDATE_RAIL_ITEMS: LeftRailItem[] = [
  { id: "chat", label: "Chats", icon: <FiMessageSquare size={18} /> },
  { id: "jobs", label: "Jobs", icon: <FiBriefcase size={18} /> },
  { id: "interviews", label: "Interviews", icon: <FiCalendar size={18} /> },
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
  {
    id: "hr-jobs-manage",
    title: "Create & Manage Jobs",
    subtitle: "Create new jobs and update existing postings",
    appRailId: "jobs",
  },
  {
    id: "hr-jobs-applications",
    title: "Applications",
    subtitle: "View job applications and candidate status",
    appRailId: "jobs",
  },
  {
    id: "hr-schedule",
    title: "Interview List",
    subtitle: "View feedback and change application status",
    appRailId: "schedule-interview",
  },
  {
    id: "hr-profile",
    title: "My Profile",
    subtitle: "View and manage your profile information",
    appRailId: "profile",
  },
];

const INTERVIEWER_PANEL_ITEMS: LeftPanelItemData[] = [
  { id: "int-my-interviews", title: "My Interviews", subtitle: "View upcoming and completed interviews", appRailId: "schedule" },
  { id: "int-chats", title: "Chats", subtitle: "Coordinate with HR and candidates", appRailId: "chat" },
  { id: "int-profile", title: "My Profile", subtitle: "View and manage your profile information", appRailId: "profile" },
];

const CANDIDATE_PANEL_ITEMS: LeftPanelItemData[] = [
  { id: "can-open-jobs", title: "Open Jobs", subtitle: "Available jobs matching your profile", appRailId: "jobs" },
  {
    id: "can-my-applications",
    title: "My Applications",
    subtitle: "Track applied jobs and progress",
    appRailId: "jobs",
  },
  {
    id: "can-my-interviews",
    title: "My Interviews",
    subtitle: "View upcoming and completed interviews",
    appRailId: "interviews",
  },
  { id: "can-chat", title: "Chats", subtitle: "Connect with HR and interviewer", appRailId: "chat" },
  { id: "can-profile", title: "My Profile", subtitle: "View and manage your profile information", appRailId: "profile" },
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

const getDefaultPanelIdForRole = (role: AuthRole | undefined): string => {
  if (role === "hr") {
    return "hr-chats";
  }
  if (role === "interviewer") {
    return "int-chats";
  }
  return "can-chat";
};

export const getDashboardPathForPanel = (panelId: string, role: AuthRole | undefined): string => {
  switch (panelId) {
    case "hr-chats":
    case "int-chats":
    case "can-chat":
      return "/dashboard/chats";
    case "hr-pending":
      return "/dashboard/pending";
    case "hr-jobs-manage":
      return "/dashboard/jobs/manage";
    case "hr-jobs-applications":
      return "/dashboard/jobs/applications";
    case "can-open-jobs":
      return "/dashboard/jobs";
    case "can-my-applications":
      return "/dashboard/my-applications";
    case "hr-schedule":
      return "/dashboard/interviews";
    case "int-my-interviews":
    case "can-my-interviews":
      return "/dashboard/my-interviews";
    case "hr-profile":
    case "int-profile":
    case "can-profile":
      return "/dashboard/profile";
    default:
      return getDashboardPathForRail(getRoleRailItems(role)[0]?.id ?? "chat", role);
  }
};

export const getDashboardPathForRail = (railId: string, role: AuthRole | undefined): string => {
  if (railId === "chat") {
    return "/dashboard/chats";
  }

  if (railId === "pending-request") {
    return "/dashboard/pending";
  }

  if (railId === "jobs") {
    return role === "hr" ? "/dashboard/jobs/manage" : role === "candidate" ? "/dashboard/jobs" : "/dashboard/chats";
  }

  if (railId === "schedule-interview" || railId === "schedule" || railId === "interviews") {
    return "/dashboard/interviews";
  }

  if (railId === "profile") {
    return "/dashboard/profile";
  }

  return getDashboardPathForPanel(getDefaultPanelIdForRole(role), role);
};

export const resolveDashboardSelection = (
  pathname: string,
  role: AuthRole | undefined,
  fallbackPanelId?: string
): DashboardSelection => {
  const normalizedPath = pathname.replace(/\/+$/, "");
  const relativePath = normalizedPath.startsWith("/dashboard")
    ? normalizedPath.slice("/dashboard".length)
    : normalizedPath;
  const [section = "", subSection = ""] = relativePath.split("/").filter(Boolean);

  if (section === "chats") {
    return { railId: "chat", panelId: subSection || "", isValid: true };
  }

  if (section === "pending" && role === "hr") {
    return { railId: "pending-request", panelId: "hr-pending", isValid: true };
  }

  if (section === "jobs" && role === "hr") {
    if (subSection === "applications") {
      return { railId: "jobs", panelId: "hr-jobs-applications", isValid: true };
    }
    if (subSection === "" || subSection === "manage") {
      return { railId: "jobs", panelId: "hr-jobs-manage", isValid: true };
    }
    return { railId: "jobs", panelId: "hr-jobs-manage", isValid: false };
  }

  if (section === "jobs") {
    if (subSection) {
      return { railId: "jobs", panelId: "can-open-jobs", isValid: false };
    }
    return { railId: "jobs", panelId: "can-open-jobs", isValid: true };
  }

  if (section === "applications") {
    if (role === "hr") {
      return { railId: "jobs", panelId: "hr-jobs-applications", isValid: true };
    }
    if (subSection) {
      return { railId: "jobs", panelId: "can-my-applications", isValid: false };
    }
    return { railId: "jobs", panelId: "can-my-applications", isValid: true };
  }

  if (section === "my-applications") {
    return { railId: "jobs", panelId: "can-my-applications", isValid: !subSection };
  }

  if (section === "interviews") {
    if (role === "hr") {
      return { railId: "schedule-interview", panelId: "hr-schedule", isValid: !subSection };
    }
    if (role === "interviewer") {
      return { railId: "schedule", panelId: "int-my-interviews", isValid: !subSection };
    }
    return { railId: "interviews", panelId: "can-my-interviews", isValid: !subSection };
  }

  if (section === "my-interviews") {
    if (role === "hr") {
      return { railId: "schedule-interview", panelId: "hr-schedule", isValid: false };
    }
    if (role === "interviewer") {
      return { railId: "schedule", panelId: "int-my-interviews", isValid: !subSection };
    }
    return { railId: "interviews", panelId: "can-my-interviews", isValid: !subSection };
  }

  if (section === "profile") {
    if (role === "hr") {
      return { railId: "profile", panelId: "hr-profile", isValid: !subSection };
    }
    if (role === "interviewer") {
      return { railId: "profile", panelId: "int-profile", isValid: !subSection };
    }
    return { railId: "profile", panelId: "can-profile", isValid: !subSection };
  }

  const defaultPanelId = fallbackPanelId || getDefaultPanelIdForRole(role);
  return {
    railId: getRolePanelItems(role).find((item) => item.id === defaultPanelId)?.appRailId ?? getRoleRailItems(role)[0]?.id ?? "chat",
    panelId: defaultPanelId,
    isValid: section === "",
  };
};
