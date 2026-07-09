import type { Request } from 'express';

export const USER_ROLES = ['hr', 'candidate', 'interviewer'] as const;
export type UserRole = (typeof USER_ROLES)[number];
export const AUTH_PROVIDERS = ['local', 'google', 'hybrid'] as const;
export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

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

export interface GetOrUpdateProfileRequestBody {
  name?: string;
  email?: string;
  phone?: string;
  currentLocation?: string;
  skills?: string;
  experienceYears?: number;
  resumeUrl?: string;
  department?: string;
  position?: string;
  techStack?: string;
  experienceLevel?: string;
}

export interface AuthenticatedUserPayload {
  userId: string;
}

export interface AuthenticatedRequest extends Request {
  authenticatedUserId?: string;
}
