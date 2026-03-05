export type UserRole = "hr" | "candidate" | "interviewer";

export interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface VerifyEmailRequestBody {
  email: string;
  otp: string;
}

export interface ResendOtpRequestBody {
  email: string;
}

export interface UpdateApprovalStatusRequestBody {
  isApproved: boolean;
}

export interface CompleteProfileRequestBody {
  phone?: string;
  resumeUrl?: string;
  skills?: string;
  experienceYears?: number;
  currentLocation?: string;
  position?: string;
  experienceLevel?: string;
  department?: string;
  techStack?: string;
}

export interface AuthenticatedUserPayload {
  userId: string;
}
