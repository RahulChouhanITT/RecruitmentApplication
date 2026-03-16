import type { FormEvent, PropsWithChildren } from "react";
import type { ApiQueryError, AxiosBaseQueryArgs } from "../../../types/apiTypes";

export type AuthRole = "hr" | "candidate" | "interviewer";
export type JobExperienceLevel = "0" | "1-3" | "3-7" | "7+";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  role: AuthRole;
  fullName: string;
  email: string;
  password: string;
};

export type VerifyEmailPayload = {
  email: string;
  otp: string;
};

export type ResendOtpPayload = {
  email: string;
};

export type AuthLoaderProps = {
  message?: string;
};

export type AuthLayoutProps = PropsWithChildren<{
  title: string;
  subtitle: string;
}>;

export type AuthModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  closeLabel?: string;
  primaryLabel?: string;
  onPrimaryAction?: () => void;
};

export type LoginFormProps = {
  formValues: LoginPayload;
  errors: Partial<Record<keyof LoginPayload, string>>;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  isSubmitting?: boolean;
};

export type RegisterFormProps = {
  formValues: RegisterPayload;
  errors: Partial<Record<keyof RegisterPayload, string>>;
  onChangeRole: (value: AuthRole) => void;
  onChangeName: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  isSubmitting?: boolean;
};

export type VerifyLocationState = {
  email?: string;
  autoSendOtp?: boolean;
};

export type LoginPageModalState = {
  open: boolean;
  title: string;
  message: string;
  primaryLabel?: string;
  primaryAction?: "verify_email";
  email?: string;
};

export type AuthAxiosBaseQueryArgs = AxiosBaseQueryArgs;

export type AuthApiQueryError = ApiQueryError;

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: AuthRole;
  profileCompleted: boolean;
  isEmailVerified: boolean;
  isApproved: boolean;
};

export type PendingApprovalUser = AuthUser;

export type InterviewerOption = {
  _id: string;
  name: string;
  email: string;
};

export type Job = {
  _id: string;
  title: string;
  description: string;
  requiredSkills: string;
  experienceLevel: string;
  createdBy: string;
  isActive: boolean;
  applicationCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type JobApplication = {
  _id: string;
  jobId: Job | string;
  candidateId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationStatus = "APPLIED" | "SHORTLISTED" | "INTERVIEW_SCHEDULED" | "HIRED" | "REJECTED";
export type FeedbackStatus = "PENDING" | "NEEDS_REVIEW" | "REVIEWED";

export type HrJobApplication = {
  _id: string;
  status: ApplicationStatus | string;
  createdAt: string;
  updatedAt: string;
  candidate: {
    _id: string;
    name: string;
    email: string;
  };
  profile: {
    skills: string;
    experienceYears: number;
    resumeUrl: string;
    currentLocation: string;
  };
};

export type HrInterview = {
  _id: string;
  applicationId: string;
  applicationStatus?: ApplicationStatus | string;
  feedbackStatus?: FeedbackStatus | string;
  candidate: {
    _id: string;
    name: string;
    email: string;
  };
  job: {
    _id: string;
    title: string;
  };
  interviewerName: string;
  interviewDate: string;
  interviewTime: string;
  meetingLink: string;
  notes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type CandidateInterview = {
  _id: string;
  applicationId: string;
  feedbackStatus?: FeedbackStatus | string;
  job: {
    _id: string;
    title: string;
  };
  interviewerName: string;
  interviewDate: string;
  interviewTime: string;
  meetingLink: string;
  notes: string;
  status: string;
  result: "Passed" | "Failed" | "Pending";
  createdAt: string;
  updatedAt: string;
};

export type InterviewerInterview = {
  _id: string;
  applicationId: string;
  feedbackStatus?: FeedbackStatus | string;
  job: {
    _id: string;
    title: string;
  };
  candidate: {
    _id: string;
    name: string;
    email: string;
  };
  interviewerName: string;
  interviewDate: string;
  interviewTime: string;
  meetingLink: string;
  notes: string;
  status: string;
  result: "Passed" | "Failed" | "Pending";
  createdAt: string;
  updatedAt: string;
};

export type InterviewFeedback = {
  _id: string;
  interviewId: string;
  rating: number;
  comments: string;
  recommendation: "HIRED" | "REJECTED";
  feedbackStatus?: FeedbackStatus | string;
  submittedAt: string;
  candidate: {
    _id: string;
    name: string;
    email: string;
  };
};

export type InterviewTimeSlot = {
  time: string;
  available: boolean;
};

export type CreateJobPayload = {
  title: string;
  description: string;
  requiredSkills: string;
  experienceLevel: JobExperienceLevel | "";
};

export type UpdateJobPayload = Partial<CreateJobPayload>;

export type CompleteProfilePayload = {
  phone?: string;
  resumeUrl?: string;
  skills?: string;
  experienceYears?: number;
  currentLocation?: string;
  position?: string;
  experienceLevel?: string;
  department?: string;
  techStack?: string;
};

export type UserProfile = {
  name: string;
  email: string;
  role: AuthRole;
  profileCompleted: boolean;
  phone?: string;
  currentLocation?: string;
  skills?: string;
  experienceYears?: number;
  resumeUrl?: string;
  department?: string;
  position?: string;
  techStack?: string;
  experienceLevel?: string;
};

export type UpdateProfilePayload = {
  name: string;
  phone?: string;
  currentLocation?: string;
  skills?: string;
  experienceYears?: number;
  resumeUrl?: string;
  department?: string;
  position?: string;
  techStack?: string;
  experienceLevel?: string;
};

export type AuthApiResponse<T = unknown> = {
  success?: boolean;
  message?: string;
  data?: T;
  token?: string;
};
