import type { HrInterview } from "../jobs/types";

export type HrInterviewStatusFilter = "all" | "scheduled" | "completed" | "cancelled";

export type HrFeedbackStatusFilter = "all" | "pending" | "needs_review" | "reviewed";

export type HrInterviewScheduleFormValues = {
  selectedDateTime: Date | null;
  durationMinutes: 30 | 60 | 90;
  interviewerId: string;
  notes: string;
};

export type HrInterviewActionMenuAnchor = {
  interviewId: string;
  top: number;
  left: number;
};

export type HrInterviewActionState = HrInterview | null;
