import type { FeedbackStatus, InterviewStatus } from '../../models/interviewModel';
import type { IApplication } from '../../models/applicationModel';
import type { IInterview } from '../../models/interviewModel';
import type { IJob } from '../../models/jobModel';
import type { IUser } from '../../models/userModel';
import { Types } from 'mongoose';
import type { PopulatedCandidate } from './candidateTypes';

export const APPLICATION_STATUSES = [
  'APPLIED',
  'SHORTLISTED',
  'INTERVIEW_SCHEDULED',
  'HIRED',
  'REJECTED',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type UpdateApplicationStatusBody = {
  newApplicationStatus: string;
};

export type ApplicationListQuery = {
  search?: string;
  status?: string;
  page?: string;
  limit?: string;
};

export type InterviewListQuery = {
  search?: string;
  view?: string;
  status?: string;
  feedbackStatus?: string;
  page?: string;
  limit?: string;
};

export type ScheduleInterviewInput = {
  interviewerId?: string;
  interviewDate: string;
  interviewTime: string;
  interviewerName?: string;
  notes?: string;
};

export type ScheduleInterviewByHrBody = {
  applicationId: string;
  interviewerId: string;
  interviewDate: string;
  interviewTime: string;
  notes?: string;
};

export type InterviewFeedbackStatus = FeedbackStatus;
export type InterviewLifecycleStatus = InterviewStatus;

export type InterviewerUser = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: string;
};

export type InterviewSchedulingContext = {
  applicationEntity: IApplication;
  jobEntity: IJob;
  candidate: IUser;
  interviewer: InterviewerUser;
  interviewDate: string;
  interviewTime: string;
  notes: string;
};

export type InterviewMeetingDetails = {
  meetingLink: string;
  startDateTime: string;
  endDateTime: string;
};

export type InterviewSchedulingResult = {
  interviewSchedulingContext: InterviewSchedulingContext;
  scheduledInterview: IInterview;
  meetingDetails: InterviewMeetingDetails;
};

export type PopulatedJob = {
  _id?: Types.ObjectId;
  title?: string;
} | null;

export type PopulatedApplication = {
  _id?: Types.ObjectId;
  status?: string;
} | null;

export type HrJobApplicationWithCandidateLean = {
  _id: Types.ObjectId;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  candidateId: Types.ObjectId | PopulatedCandidate;
};

export type CandidateProfileSummary = {
  userId: Types.ObjectId;
  skills: string;
  experienceYears: number;
  resumeUrl: string;
  currentLocation: string;
};

export type HrInterviewLean = {
  _id: Types.ObjectId;
  applicationId: Types.ObjectId | PopulatedApplication;
  candidateId: Types.ObjectId | PopulatedCandidate;
  jobId: Types.ObjectId | PopulatedJob;
  interviewerName: string;
  interviewDate: string;
  interviewTime: string;
  meetingLink: string;
  notes?: string;
  status: string;
  feedbackStatus?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CandidateInterviewLean = {
  _id: Types.ObjectId;
  applicationId: Types.ObjectId | { status?: string } | null;
  jobId: Types.ObjectId | PopulatedJob;
  interviewerName: string;
  interviewDate: string;
  interviewTime: string;
  meetingLink: string;
  notes?: string;
  status: string;
  feedbackStatus?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InterviewerInterviewLean = {
  _id: Types.ObjectId;
  applicationId: Types.ObjectId;
  candidateId: Types.ObjectId | PopulatedCandidate;
  jobId: Types.ObjectId | PopulatedJob;
  interviewerName: string;
  interviewDate: string;
  interviewTime: string;
  meetingLink: string;
  notes?: string;
  status: string;
  feedbackStatus?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CandidateInterviewResult = 'Passed' | 'Failed' | 'Pending';
export type InterviewerInterviewResult = 'Passed' | 'Failed' | 'Pending';
