export type AuthRole = "hr" | "candidate" | "interviewer";

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

export type AuthApiResponse<T = unknown> = {
  success?: boolean;
  message?: string;
  data?: T;
  token?: string;
};
