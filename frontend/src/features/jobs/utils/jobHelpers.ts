import { JOBS_DEFAULT_MESSAGES } from '../labels/jobLabels';

export const getJobErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }

  return fallback;
};

export const formatJobsDate = (value: string): string =>
  new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const normalizeApplicationDisplayStatus = (status: string): string =>
  status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());

export const toInterviewDateTime = (date: string, time: string): Date =>
  new Date(`${date}T${time}:00+05:30`);

export const getAppliedJobId = (jobId: { _id?: string } | string): string | null =>
  typeof jobId === 'string' ? jobId : (jobId?._id ?? null);

export const getJobTitleFallback = (title?: string): string =>
  title ?? JOBS_DEFAULT_MESSAGES.JOB_FALLBACK_TITLE;
