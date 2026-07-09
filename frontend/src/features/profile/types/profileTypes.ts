import type { AuthRole } from '../../auth/types';

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

export type ResumeUploadResponse = {
  resumeUrl: string;
  resumePublicId: string;
};
