export const DASHBOARD_MESSAGES = {
  TITLE: "Dashboard",
  LOGOUT: "Logout",
  LOGGING_OUT: "Logging out...",
  LOADING_MODULE: "Loading section...",
  LOGOUT_SUCCESS: "Logged out successfully",
  LOGOUT_FAILED: "Logout failed",
  MODULE_RENDER_ERROR: "Something went wrong while rendering this section.",
  PROFILE_COMPLETED_SUCCESS: "Profile completed successfully",
  PROFILE_COMPLETED_FAILED: "Failed to complete profile",
} as const;

export const DASHBOARD_PROFILE_LABELS = {
  COMPLETE_PROFILE_TITLE: "Complete Your Profile",
  COMPLETE_PROFILE_PRIMARY: "Complete Profile",
  COMPLETE_PROFILE_CLOSE: "Cancel",
  CANDIDATE_PROMPT:
    "Your profile is incomplete. Please complete your profile to apply for jobs. Required information includes phone number, resume, skills, experience, and location.",
  DEFAULT_PROMPT: "Please complete your profile before continuing.",
} as const;

export const DASHBOARD_CHAT_LABELS = {
  EMPTY_TITLE: "No Chats Yet",
  EMPTY_DESCRIPTION: "No conversations available right now.",
  START_CHAT: "Start Chat With HR",
  STARTING_CHAT: "Starting...",
  PANEL_TITLE: "Chat",
  HEADER_MORE: "More",
  HEADER_SEARCH: "Search",
  HEADER_NEW_CHAT: "New chat",
  FILTER_UNREAD: "Unread",
  FILTER_CHANNELS: "Channels",
  FILTER_CHATS: "Chats",
  DEFAULT_TITLE: "Conversation",
  DEFAULT_LAST_MESSAGE: "Start the conversation...",
  ONLINE: "Online",
  OFFLINE: "Offline",
  COMPOSER_PLACEHOLDER: "Type a message",
  SEND: "Send",
} as const;

export const DASHBOARD_WORKSPACE_LABELS = {
  DEFAULT_USER: "Workspace User",
  SEARCH_PLACEHOLDER: "Search chats and channels",
  EXPAND_SIDEBAR: "Expand sidebar",
  COLLAPSE_SIDEBAR: "Collapse sidebar",
  CLOSE_SIDEBAR: "Close sidebar",
  ONLINE: "Online",
  OFFLINE: "Offline",
} as const;

export const DASHBOARD_EMPTY_STATE_LABELS = {
  NO_INTERVIEWS_TITLE: "No Interviews",
  NO_INTERVIEWS_DESCRIPTION: "No interview entries to show in this section yet.",
  NO_SCHEDULED_INTERVIEWS_TITLE: "No Scheduled Interviews",
  NO_SCHEDULED_INTERVIEWS_DESCRIPTION: "No interview schedules to show yet.",
  NO_DATA_TITLE: "No Data Yet",
  NO_DATA_DESCRIPTION: "No items available in this section right now.",
  SELECT_SECTION_TITLE: "Select a Section",
  SELECT_SECTION_DESCRIPTION: "Choose a section from the left menu to continue.",
} as const;
