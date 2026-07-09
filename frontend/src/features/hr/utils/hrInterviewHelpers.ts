import type { InterviewerOption } from '../types/hrTypes';
import { HR_INTERVIEW_INITIAL_VALUES } from '../constants/hrConstants';
import {
  HR_INTERVIEW_DEFAULT_MESSAGES,
  HR_INTERVIEW_UI_TEXT,
  HR_INTERVIEW_VALIDATION_MESSAGES,
} from '../labels/hrLabels';
import type {
  HrFeedbackStatusFilter,
  HrInterviewActionMenuAnchor,
  HrInterviewScheduleFormValues,
  HrInterviewStatusFilter,
} from '../types/hrTypes';
import type { HrInterview } from '../../jobs/types/jobTypes';

export const formatFeedbackStatus = (status?: string): string => {
  const normalized = (status ?? HR_INTERVIEW_INITIAL_VALUES.EMPTY_STRING).trim().toUpperCase();

  if (normalized === 'NEEDS_REVIEW') {
    return 'Needs Review';
  }
  if (normalized === 'REVIEWED') {
    return 'Reviewed';
  }
  if (normalized === 'PENDING') {
    return 'Pending';
  }

  return HR_INTERVIEW_DEFAULT_MESSAGES.SUBMITTED_ON_FALLBACK;
};

export const canOpenFeedbackModal = (status?: string): boolean => {
  const normalized = (status ?? HR_INTERVIEW_INITIAL_VALUES.EMPTY_STRING).trim().toUpperCase();
  return normalized === 'NEEDS_REVIEW' || normalized === 'REVIEWED';
};

export const getInterviewTone = (status?: string): 'scheduled' | 'completed' | 'cancelled' => {
  const normalized = (status ?? HR_INTERVIEW_INITIAL_VALUES.EMPTY_STRING).trim().toUpperCase();

  if (normalized === 'COMPLETED') {
    return 'completed';
  }
  if (normalized === 'CANCELLED') {
    return 'cancelled';
  }

  return 'scheduled';
};

export const getInterviewStatusLabel = (status?: string): string => {
  const tone = getInterviewTone(status);

  if (tone === 'completed') {
    return HR_INTERVIEW_UI_TEXT.COMPLETED;
  }
  if (tone === 'cancelled') {
    return HR_INTERVIEW_UI_TEXT.CANCELLED;
  }

  return HR_INTERVIEW_UI_TEXT.SCHEDULED;
};

export const toScheduledDateTime = (interviewDate: string, interviewTime: string): Date | null => {
  const parsed = new Date(`${interviewDate}T${interviewTime}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const toInterviewDate = (selectedDateTime: Date | null): string => {
  if (!selectedDateTime) {
    return HR_INTERVIEW_INITIAL_VALUES.EMPTY_STRING;
  }

  const year = selectedDateTime.getFullYear();
  const month = String(selectedDateTime.getMonth() + 1).padStart(2, '0');
  const day = String(selectedDateTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const toInterviewTime = (selectedDateTime: Date | null): string => {
  if (!selectedDateTime) {
    return HR_INTERVIEW_INITIAL_VALUES.EMPTY_STRING;
  }

  const hours = String(selectedDateTime.getHours()).padStart(2, '0');
  const minutes = String(selectedDateTime.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const findInterviewerIdByName = (
  interviewerName: string,
  interviewerOptions: InterviewerOption[],
): string => {
  const matchedInterviewer = interviewerOptions.find(
    (interviewer) => interviewer.name.trim().toLowerCase() === interviewerName.trim().toLowerCase(),
  );

  return matchedInterviewer?._id ?? HR_INTERVIEW_INITIAL_VALUES.EMPTY_STRING;
};

export const getInterviewActionMenuAnchor = (
  interviewId: string,
  triggerElement: HTMLButtonElement,
): HrInterviewActionMenuAnchor => {
  const triggerRect = triggerElement.getBoundingClientRect();
  const menuWidth = 192;
  const menuHeight = 104;
  const viewportPadding = 8;
  const computedLeft = Math.max(
    viewportPadding,
    Math.min(triggerRect.right - menuWidth, window.innerWidth - menuWidth - viewportPadding),
  );
  const computedTop = Math.max(viewportPadding, triggerRect.top - menuHeight - 6);

  return {
    interviewId,
    top: computedTop,
    left: computedLeft,
  };
};

export const filterHrInterviews = (
  interviews: HrInterview[],
  interviewStatusFilter: HrInterviewStatusFilter,
  feedbackStatusFilter: HrFeedbackStatusFilter,
  searchQuery: string,
): HrInterview[] => {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return interviews.filter((interview) => {
    const normalizedInterviewStatus = (interview.status ?? '').trim().toUpperCase();
    const normalizedFeedbackStatus = (interview.feedbackStatus ?? '').trim().toUpperCase();

    const matchesInterviewStatus =
      interviewStatusFilter === 'all' ||
      (interviewStatusFilter === 'scheduled' && normalizedInterviewStatus === 'SCHEDULED') ||
      (interviewStatusFilter === 'completed' && normalizedInterviewStatus === 'COMPLETED') ||
      (interviewStatusFilter === 'cancelled' && normalizedInterviewStatus === 'CANCELLED');

    const matchesFeedbackStatus =
      feedbackStatusFilter === 'all' ||
      (feedbackStatusFilter === 'pending' && normalizedFeedbackStatus === 'PENDING') ||
      (feedbackStatusFilter === 'needs_review' && normalizedFeedbackStatus === 'NEEDS_REVIEW') ||
      (feedbackStatusFilter === 'reviewed' && normalizedFeedbackStatus === 'REVIEWED');

    if (!matchesInterviewStatus || !matchesFeedbackStatus) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchable = [
      interview.candidate.name,
      interview.candidate.email,
      interview.interviewerName,
      interview.job.title,
    ]
      .join(' ')
      .toLowerCase();

    return searchable.includes(normalizedQuery);
  });
};

export const validateHrScheduleForm = (
  scheduleFormValues: HrInterviewScheduleFormValues,
): Partial<Record<keyof HrInterviewScheduleFormValues, string>> => {
  const nextErrors: Partial<Record<keyof HrInterviewScheduleFormValues, string>> = {};

  if (!scheduleFormValues.selectedDateTime) {
    nextErrors.selectedDateTime = HR_INTERVIEW_VALIDATION_MESSAGES.PICK_DATE_TIME;
  }

  if (!scheduleFormValues.interviewerId.trim()) {
    nextErrors.interviewerId = HR_INTERVIEW_VALIDATION_MESSAGES.INTERVIEWER_REQUIRED;
  }

  return nextErrors;
};
