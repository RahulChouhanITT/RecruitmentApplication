import type { UserRole } from "../types/authTypes";

export const ROUTE_ROLE_GROUPS = {
  HR_ONLY: ["hr"],
  CANDIDATE_ONLY: ["candidate"],
  INTERVIEWER_ONLY: ["interviewer"],
  CHAT_ALLOWED: ["candidate", "hr", "interviewer"],
} as const satisfies Record<string, readonly UserRole[]>;

export const ROUTE_FIELD_NAMES = {
  RESUME: "resume",
} as const;

export const API_ROUTE_PREFIXES = {
  AUTH: "/api/auth",
  JOBS: "/api/jobs",
  CANDIDATE: "/api/candidate",
  APPLICATIONS: "/api/applications",
  INTERVIEWS: "/api/interviews",
  FEEDBACK: "/api/feedback",
  GOOGLE: "/api/google",
  CHATS: "/api/chats",
} as const;

export const AUTH_ROUTES = {
  REGISTER: "/register",
  LOGIN: "/login",
  VERIFY_EMAIL: "/verify-email",
  RESEND_OTP: "/resend-otp",
  LOGOUT: "/logout",
  ME: "/me",
  PROFILE: "/profile",
  COMPLETE_PROFILE: "/profile/complete",
  INTERVIEWERS: "/interviewers",
  PENDING_APPROVALS: "/pending-approvals",
  UPDATE_APPROVAL: "/approvals/:userId",
} as const;

export const CANDIDATE_ROUTES = {
  RESUME: "/resume",
} as const;

export const JOB_ROUTES = {
  ROOT: "/",
  MY_JOBS: "/my",
  APPLIED_JOBS: "/applied/me",
  UPDATE_JOB: "/:jobId",
  JOB_APPLICATIONS: "/:jobId/applications",
  CLOSE_JOB: "/:jobId/close",
  ACTIVATE_JOB: "/:jobId/activate",
  APPLY_FOR_JOB: "/:jobId/apply",
} as const;

export const APPLICATION_ROUTES = {
  UPDATE_STATUS: "/:applicationId/status",
  SCHEDULE_INTERVIEW: "/:applicationId/schedule",
} as const;

export const INTERVIEW_ROUTES = {
  HR_INTERVIEWS: "/hr",
  SCHEDULE: "/schedule",
  CANCEL: "/:interviewId/cancel",
  AVAILABILITY: "/availability",
  CANDIDATE_INTERVIEWS: "/candidate",
  INTERVIEWER_INTERVIEWS: "/interviewer",
} as const;

export const FEEDBACK_ROUTES = {
  SUBMIT: "/",
  HR_INTERVIEW_FEEDBACK: "/interview/:interviewId",
} as const;

export const CHAT_ROUTES = {
  CONVERSATIONS: "/conversations",
  DIRECT_CONVERSATION: "/conversations/direct",
  START_CANDIDATE_HR_CONVERSATION: "/conversations/start-candidate-hr",
  CONVERSATION_MESSAGES: "/conversations/:conversationId/messages",
  MARK_CONVERSATION_SEEN: "/conversations/:conversationId/seen",
} as const;

export const GOOGLE_ROUTES = {
  OAUTH_URL: "/oauth/url",
  OAUTH_CALLBACK: "/oauth/callback",
} as const;
