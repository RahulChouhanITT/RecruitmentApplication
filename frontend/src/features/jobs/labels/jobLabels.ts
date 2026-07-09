import type {
  ApplicationStatus,
  InterviewsViewFilter,
  JobsStatusFilter,
  MyApplicationsStatusFilter,
} from '../types/jobTypes';

export const JOBS_DEFAULT_MESSAGES = {
  API_REQUEST_FAILED: 'Something went wrong while calling API',
  APPLY_SUCCESS: 'Applied successfully',
  APPLY_FAILED: 'Failed to apply for job',
  SAVE_JOB_FAILED: 'Failed to save job',
  CLOSE_JOB_FAILED: 'Failed to close job',
  ACTIVATE_JOB_FAILED: 'Failed to activate job',
  UPDATE_APPLICATION_STATUS_FAILED: 'Failed to update application status',
  SCHEDULE_INTERVIEW_FAILED: 'Failed to schedule interview',
  CANCEL_INTERVIEW_FAILED: 'Failed to cancel interview',
  LOADING_JOBS: 'Loading jobs...',
  NO_OPEN_JOBS_TITLE: 'No Open Jobs',
  NO_OPEN_JOBS_DESCRIPTION: 'No open jobs available at the moment.',
  NO_JOBS_FOUND_TITLE: 'No Jobs Found',
  NO_JOBS_FOUND_DESCRIPTION: 'No jobs match your current filter or search.',
  NO_APPLICATIONS_TITLE: 'No Applications',
  NO_APPLICATIONS_DESCRIPTION: 'You have not applied to any jobs yet.',
  NO_APPLICATIONS_FOUND_TITLE: 'No Applications Found',
  NO_APPLICATIONS_FOUND_DESCRIPTION: 'No applications match your current filter or search.',
  LOADING_APPLICATIONS: 'Loading applications...',
  NO_INTERVIEWS_TITLE: 'No Interviews',
  NO_INTERVIEWS_DESCRIPTION: 'No interviews scheduled yet.',
  NO_INTERVIEWS_FOUND_TITLE: 'No Interviews Found',
  NO_INTERVIEWS_FOUND_DESCRIPTION: 'No interviews for this filter.',
  LOADING_INTERVIEWS: 'Loading interviews...',
  JOB_FALLBACK_TITLE: 'Job',
  SELECTED_JOB_FALLBACK_TITLE: 'Selected Job',
  UNKNOWN_STATUS: 'Unknown',
  COMPANY_NAME: 'Recruitment Portal',
  JOBS_UNAVAILABLE_TITLE: 'Jobs Unavailable',
  JOBS_UNAVAILABLE_DESCRIPTION: 'Jobs module is available for HR and Candidate only.',
} as const;

export const JOBS_UI_TEXT = {
  OPEN_JOBS_TITLE: 'Open Jobs',
  MY_APPLICATIONS_TITLE: 'My Applications',
  MY_INTERVIEWS_TITLE: 'My Interviews',
  SEARCH_JOBS_PLACEHOLDER: 'Search by title, required skills',
  SEARCH_APPLICATIONS_PLACEHOLDER: 'Search by title, skills or company',
  SEARCH_INTERVIEWS_PLACEHOLDER: 'Search by interview title',
  STATUS_ACTIVE_HIRING: 'Actively hiring',
  STATUS_CLOSED: 'Closed',
  STATUS_APPLIED: 'Applied',
  ACTION_APPLY: 'Apply',
  APPLICATIONS_ALL_LABEL: 'All Applications',
  INTERVIEW_PERSON_LABEL: 'Interviewer',
  INTERVIEW_JOIN_MEETING: 'Join meeting',
  INTERVIEW_COMPLETED: 'Completed',
  INTERVIEW_SCHEDULED: 'Scheduled',
  INTERVIEW_CANCELLED: 'Cancelled',
  APPLICATION_APPLIED_ON: 'Applied on',
  APPLICATIONS_FOR: 'Applications for',
  COMPANY_LABEL: 'Company',
  DATE_LABEL: 'Date',
  TIME_LABEL: 'Time',
  ALL_JOBS: 'All Jobs',
  VIEW_APPLICATIONS: 'View Applications',
  MANAGE_JOBS_TITLE: 'Manage Jobs',
  JOBS_APPLICATIONS_TITLE: 'Jobs Applications',
  SEARCH_MANAGE_PLACEHOLDER: 'Search by title, experience, skills',
  SEARCH_APPLICATIONS_TABLE_PLACEHOLDER: 'Search by candidate, email, skills',
  SEARCH_APPLICATIONS_JOBS_PLACEHOLDER: 'Search by title, experience, skills',
  BACK_TO_JOBS_ARIA: 'Back to jobs',
  CREATE_JOB_ARIA: 'Create job',
  OPEN_APPLICATION_ACTIONS_ARIA: 'Open application actions',
  FILTER_APPLICATIONS_ARIA: 'Filter applications by status',
  ALL_STATUSES: 'All Statuses',
  ACTIVE_STATUS: 'Active',
  CLOSED_STATUS: 'Closed',
  APPLICATIONS_SUFFIX: 'applications',
  YEARS_SUFFIX: 'years',
  VIEW_RESUME: 'View',
  CHANGE_STATUS: 'Change Status',
  ASSIGN_INTERVIEWER: 'Assign Interviewer',
  HIRE: 'Hire',
  REJECT: 'Reject',
  EDIT: 'Edit',
  CLOSE: 'Close',
  ACTIVATE: 'Activate',
  UPDATE_STATUS: 'Update Status',
  CONFIRM: 'Confirm',
  CANCEL: 'Cancel',
  CREATE_JOB: 'Create Job',
  UPDATE_JOB: 'Update Job',
  SCHEDULE_INTERVIEW: 'Schedule Interview',
  SCHEDULING: 'Scheduling...',
  CONFIRM_STATUS_UPDATE: 'Confirm Status Update',
  CONFIRM_JOB_STATUS: 'Confirm Job Status',
  CHANGE_APPLICATION_STATUS: 'Change Application Status',
  SELECT_STATUS: 'Select Status',
  INTERVIEW_DATE_TIME: 'Interview date & time',
  PICK_A_SLOT: 'Pick a slot',
  AVAILABLE_INTERVIEWERS: 'Available Interviewers',
  SELECT_INTERVIEWER: 'Select interviewer',
  NOTES: 'Notes',
  OPTIONAL_INTERVIEW_NOTES: 'Optional interview notes',
  JOB_TITLE: 'Job title',
  EXPERIENCE_LEVEL: 'Experience level',
  REQUIRED_SKILLS: 'Required skills',
  JOB_DESCRIPTION: 'Job description',
  NO_JOBS: 'No Jobs',
  NO_APPLICATIONS: 'No Applications',
  FIELD_ERROR_PLACEHOLDER: '\u00A0',
  LOADING_APPLICATIONS: 'Loading applications...',
  NO_APPLICATIONS_FOR_JOB_DESCRIPTION: 'No applications found for this job.',
  NO_FILTERED_JOBS_DESCRIPTION: 'No jobs match your current filter or search.',
  CANDIDATE: 'Candidate',
  EMAIL: 'Email',
  SKILLS: 'Skills',
  EXPERIENCE: 'Experience',
  RESUME: 'Resume',
  STATUS: 'Status',
  ACTIONS: 'Actions',
  UPDATED: 'Updated',
  MINUTES_SUFFIX: 'min',
  SELECTED_JOB: 'Selected Job',
} as const;

export const JOBS_FILTER_LABELS: Record<JobsStatusFilter, string> = {
  all: 'All',
  active: 'Active',
  closed: 'Closed',
};

export const MY_APPLICATIONS_FILTER_OPTIONS: Array<{
  value: MyApplicationsStatusFilter;
  label: string;
}> = [
  { value: 'all', label: 'All Applications' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
  { value: 'HIRED', label: 'Hired' },
  { value: 'REJECTED', label: 'Rejected' },
];

export const INTERVIEWS_FILTER_LABELS: Record<InterviewsViewFilter, string> = {
  all: 'All',
  upcoming: 'Upcoming',
  completed: 'Completed',
};

export const JOBS_EXPERIENCE_OPTIONS = [
  { value: '0', label: '0 years (Fresher)' },
  { value: '1-3', label: '1-3 years' },
  { value: '3-7', label: '3-7 years' },
  { value: '7+', label: '7+ years' },
] as const;

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: 'Applied',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW_SCHEDULED: 'Interview Scheduled',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
};

export const JOBS_VALIDATION_MESSAGES = {
  DESCRIPTION_WORD_LIMIT: (count: number) => `Job description cannot exceed ${count} words`,
  TITLE_REQUIRED: 'Job title is required',
  TITLE_MIN_LENGTH: 'Job title must be at least 3 characters',
  TITLE_MAX_LENGTH: (count: number) => `Job title cannot exceed ${count} characters`,
  EXPERIENCE_LEVEL_REQUIRED: 'Experience level is required',
  EXPERIENCE_LEVEL_INVALID: 'Select a valid experience range (0, 1-3, 3-7, 7+)',
  REQUIRED_SKILLS_REQUIRED: 'Required skills are mandatory',
  REQUIRED_SKILLS_MAX_LENGTH: (count: number) =>
    `Required skills cannot exceed ${count} characters`,
  DESCRIPTION_REQUIRED: 'Job description is required',
  DESCRIPTION_MIN_LENGTH: 'Job description must be at least 20 characters',
  DESCRIPTION_MAX_LENGTH: (count: number) => `Job description cannot exceed ${count} characters`,
  PICK_DATE_TIME: 'Pick a date and time slot',
  INTERVIEWER_REQUIRED: 'Interviewer is required',
} as const;

export const JOBS_SUCCESS_MESSAGES = {
  JOB_UPDATED: 'Job updated successfully',
  JOB_CREATED: 'Job created successfully',
  JOB_CLOSED: 'Job closed successfully',
  JOB_ACTIVATED: 'Job activated successfully',
  APPLICATION_STATUS_UPDATED: 'Application status updated successfully',
  INTERVIEW_SCHEDULED: 'Interview scheduled successfully',
  INTERVIEW_CANCELLED: 'Interview cancelled successfully',
} as const;

export const JOBS_PANEL_TEXT = {
  REQUIRED_SKILLS_TOOLTIP: 'Comma-separated, e.g. React, TypeScript, Redux.',
  JOB_DESCRIPTION_TOOLTIP: (words: number, chars: number) =>
    `Keep it concise: max ${words} words and ${chars} characters.`,
  JOB_TITLE_PLACEHOLDER: 'e.g. Senior Frontend Developer',
  EXPERIENCE_RANGE_PLACEHOLDER: 'Select experience range',
  REQUIRED_SKILLS_PLACEHOLDER: 'e.g. React, TypeScript, Redux Toolkit',
  JOB_DESCRIPTION_PLACEHOLDER:
    'e.g. Build and maintain reusable UI components, collaborate with backend team, and optimize performance.',
  STATUS_CONFIRMATION: (status: string) =>
    `Are you sure you want to update the candidate status to ${status}?`,
  JOB_STATUS_CONFIRMATION: (action: string) =>
    `Are you sure you want to ${action.toLowerCase()} this job?`,
  NO_FILTERED_JOBS: (filter: string) => `No ${filter} jobs found.`,
  NO_JOBS: 'No jobs found.',
  CANCEL_INTERVIEW_BEFORE_STATUS_CHANGE:
    'Cancel the scheduled interview before changing application status.',
} as const;
