import type { ApplicationStatus, CreateJobPayload } from "../types/jobTypes";

export const JOBS_API_ROUTES = {
  HR_JOBS: "/api/jobs/my",
  CANDIDATE_JOBS: "/api/jobs",
  JOBS: "/api/jobs",
  APPLICATIONS_STATUS: "/api/applications",
  INTERVIEW_SCHEDULE: "/api/interviews/schedule",
  INTERVIEW_CANCEL: "/api/interviews",
  INTERVIEW_AVAILABILITY: "/api/interviews/availability",
  HR_INTERVIEWS: "/api/interviews/hr",
  CANDIDATE_INTERVIEWS: "/api/interviews/candidate",
  INTERVIEWER_INTERVIEWS: "/api/interviews/interviewer",
  FEEDBACK: "/api/feedback",
  FEEDBACK_INTERVIEW: "/api/feedback/interview",
} as const;

export const JOBS_INITIAL_VALUES = {
  JOB_FORM: {
    title: "",
    description: "",
    requiredSkills: "",
    experienceLevel: "",
  } as CreateJobPayload,
  EMPTY_STRING: "",
  SCHEDULE_FORM: {
    selectedDateTime: null,
    durationMinutes: 30,
    interviewerId: "",
    notes: "",
  } as const,
} as const;

export const JOBS_FIELD_LIMITS = {
  title: 80,
  requiredSkills: 180,
  description: 250,
  descriptionWords: 50,
} as const;

export const APPLICATION_STATUS_SEQUENCE: ApplicationStatus[] = [
  "APPLIED",
  "SHORTLISTED",
  "INTERVIEW_SCHEDULED",
  "HIRED",
  "REJECTED",
];

export const JOBS_STATUS_VALUES = {
  APPLIED: "APPLIED",
  SHORTLISTED: "SHORTLISTED",
  INTERVIEW_SCHEDULED: "INTERVIEW_SCHEDULED",
  HIRED: "HIRED",
  REJECTED: "REJECTED",
} as const;
