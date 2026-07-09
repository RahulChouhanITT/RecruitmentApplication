export type JobExperienceLevel = '0' | '1-3' | '3-7' | '7+';

export type ApplicationStatus =
  | 'APPLIED'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'HIRED'
  | 'REJECTED';

export type FeedbackStatus = 'PENDING' | 'NEEDS_REVIEW' | 'REVIEWED';

export type JobsStatusFilter = 'all' | 'active' | 'closed';
export type MyApplicationsStatusFilter = 'all' | ApplicationStatus;
export type InterviewsViewFilter = 'all' | 'upcoming' | 'completed';
export type CandidateJobsWorkspaceTab = 'open-jobs' | 'my-applications' | 'interviews';
export type InterviewsPageInitialView = 'both' | 'upcoming' | 'previous';
export type PaginationQuery = {
  page?: number;
  limit?: number;
};
export type JobsQueryParams = PaginationQuery & {
  search?: string;
  isActive?: boolean;
};
export type ApplicationsQueryParams = PaginationQuery & {
  search?: string;
  status?: ApplicationStatus;
};
export type InterviewsQueryParams = PaginationQuery & {
  search?: string;
  view?: Exclude<InterviewsViewFilter, 'all'> | 'all';
  status?: string;
  feedbackStatus?: string;
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
  result: 'Passed' | 'Failed' | 'Pending';
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
  result: 'Passed' | 'Failed' | 'Pending';
  createdAt: string;
  updatedAt: string;
};

export type InterviewFeedback = {
  _id: string;
  interviewId: string;
  rating: number;
  comments: string;
  recommendation: 'HIRED' | 'REJECTED';
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
  experienceLevel: JobExperienceLevel | '';
};

export type UpdateJobPayload = Partial<CreateJobPayload>;

export type JobsPanelProps = {
  role?: 'hr' | 'candidate' | 'interviewer';
  activePanelId?: string;
};

export type JobCardProps = {
  title: string;
  experience: string;
  requiredSkills: string;
  description: string;
  isActive: boolean;
  isApplied?: boolean;
  isApplying?: boolean;
  onApply?: () => void;
};

export type ApplicationCardProps = {
  title: string;
  experience: string;
  requiredSkills: string;
  description: string;
  status: string;
  appliedDate: string;
};

export type InterviewCardProps = {
  title: string;
  company: string;
  interviewDate: string;
  interviewTime: string;
  personName: string;
  personLabel?: string;
  meetingLink?: string;
  variant: 'upcoming' | 'previous';
  status?: string;
  result?: CandidateInterview['result'];
  onActionClick?: () => void;
  actionLabel?: string;
};

export type StatusBadgeProps = {
  status: string;
};

export type CandidateJobsWorkspaceProps = {
  initialTab?: CandidateJobsWorkspaceTab;
};

export type InterviewsPageProps = {
  initialView?: InterviewsPageInitialView;
};

export type ScheduleInterviewFormValues = {
  interviewerId: string;
  selectedDateTime: Date | null;
  durationMinutes: 30 | 60 | 90;
  notes: string;
};

export type PendingAction = {
  application: HrJobApplication;
  status: ApplicationStatus;
} | null;
