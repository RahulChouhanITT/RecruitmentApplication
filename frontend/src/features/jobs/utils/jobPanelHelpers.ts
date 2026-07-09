import { JOBS_EXPERIENCE_OPTIONS } from '../labels/jobLabels';
import { JOBS_INITIAL_VALUES, JOBS_STATUS_VALUES } from '../constants/jobConstants';
import type {
  ApplicationStatus,
  CreateJobPayload,
  HrJobApplication,
  PendingAction,
  ScheduleInterviewFormValues,
} from '../types/jobTypes';

export const normalizeApplicationStatus = (status: string): ApplicationStatus => {
  const normalized = status.trim().toUpperCase().replace(/\s+/g, '_');
  if (normalized === JOBS_STATUS_VALUES.SHORTLISTED) {
    return JOBS_STATUS_VALUES.SHORTLISTED;
  }
  if (normalized === JOBS_STATUS_VALUES.INTERVIEW_SCHEDULED) {
    return JOBS_STATUS_VALUES.INTERVIEW_SCHEDULED;
  }
  if (normalized === JOBS_STATUS_VALUES.HIRED) {
    return JOBS_STATUS_VALUES.HIRED;
  }
  if (normalized === JOBS_STATUS_VALUES.REJECTED) {
    return JOBS_STATUS_VALUES.REJECTED;
  }
  return JOBS_STATUS_VALUES.APPLIED;
};

export const hasScheduledInterview = (application: HrJobApplication): boolean =>
  normalizeApplicationStatus(application.status) === JOBS_STATUS_VALUES.INTERVIEW_SCHEDULED;

export const initialScheduleFormValues: ScheduleInterviewFormValues = {
  selectedDateTime: JOBS_INITIAL_VALUES.SCHEDULE_FORM.selectedDateTime,
  durationMinutes: JOBS_INITIAL_VALUES.SCHEDULE_FORM.durationMinutes,
  interviewerId: JOBS_INITIAL_VALUES.SCHEDULE_FORM.interviewerId,
  notes: JOBS_INITIAL_VALUES.SCHEDULE_FORM.notes,
};

export const isValidExperienceLevel = (value: string): boolean =>
  JOBS_EXPERIENCE_OPTIONS.some((option) => option.value === value);

export const normalizeExperienceLevel = (value: string): CreateJobPayload['experienceLevel'] =>
  isValidExperienceLevel(value) ? (value as CreateJobPayload['experienceLevel']) : '';

export const formatPostedAt = (isoDate: string): string => {
  const postedTime = new Date(isoDate).getTime();
  const diffMs = Date.now() - postedTime;
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.max(1, Math.floor(diffMs / dayMs));

  if (days < 7) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 5) {
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }

  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
};

export const sortJobs = <T extends { isActive: boolean; createdAt: string }>(jobs: T[]): T[] =>
  [...jobs].sort((a, b) => {
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

export const createPendingAction = (
  application: HrJobApplication,
  status: ApplicationStatus,
): PendingAction => ({
  application,
  status,
});
