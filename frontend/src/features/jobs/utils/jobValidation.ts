import { JOBS_FIELD_LIMITS } from "../constants/jobConstants";
import { JOBS_DEFAULT_MESSAGES, JOBS_VALIDATION_MESSAGES } from "../labels/jobLabels";
import type { CreateJobPayload, ScheduleInterviewFormValues } from "../types/jobTypes";
import { isValidExperienceLevel } from "./jobPanelHelpers";

export const validateJobFormValues = (
  formValues: CreateJobPayload
): Partial<Record<keyof CreateJobPayload, string>> => {
  const nextErrors: Partial<Record<keyof CreateJobPayload, string>> = {};

  if (!formValues.title.trim()) {
    nextErrors.title = JOBS_VALIDATION_MESSAGES.TITLE_REQUIRED;
  } else if (formValues.title.trim().length < 3) {
    nextErrors.title = JOBS_VALIDATION_MESSAGES.TITLE_MIN_LENGTH;
  } else if (formValues.title.length > JOBS_FIELD_LIMITS.title) {
    nextErrors.title = JOBS_VALIDATION_MESSAGES.TITLE_MAX_LENGTH(JOBS_FIELD_LIMITS.title);
  }

  if (!formValues.experienceLevel.trim()) {
    nextErrors.experienceLevel = JOBS_VALIDATION_MESSAGES.EXPERIENCE_LEVEL_REQUIRED;
  } else if (!isValidExperienceLevel(formValues.experienceLevel)) {
    nextErrors.experienceLevel = JOBS_VALIDATION_MESSAGES.EXPERIENCE_LEVEL_INVALID;
  }

  if (!formValues.requiredSkills.trim()) {
    nextErrors.requiredSkills = JOBS_VALIDATION_MESSAGES.REQUIRED_SKILLS_REQUIRED;
  } else if (formValues.requiredSkills.length > JOBS_FIELD_LIMITS.requiredSkills) {
    nextErrors.requiredSkills = JOBS_VALIDATION_MESSAGES.REQUIRED_SKILLS_MAX_LENGTH(JOBS_FIELD_LIMITS.requiredSkills);
  }

  if (!formValues.description.trim()) {
    nextErrors.description = JOBS_VALIDATION_MESSAGES.DESCRIPTION_REQUIRED;
  } else if (formValues.description.trim().length < 20) {
    nextErrors.description = JOBS_VALIDATION_MESSAGES.DESCRIPTION_MIN_LENGTH;
  } else if (formValues.description.trim().split(/\s+/).filter(Boolean).length > JOBS_FIELD_LIMITS.descriptionWords) {
    nextErrors.description = JOBS_VALIDATION_MESSAGES.DESCRIPTION_WORD_LIMIT(JOBS_FIELD_LIMITS.descriptionWords);
  } else if (formValues.description.length > JOBS_FIELD_LIMITS.description) {
    nextErrors.description = JOBS_VALIDATION_MESSAGES.DESCRIPTION_MAX_LENGTH(JOBS_FIELD_LIMITS.description);
  }

  return nextErrors;
};

export const validateScheduleFormValues = (
  scheduleFormValues: ScheduleInterviewFormValues
): Partial<Record<keyof ScheduleInterviewFormValues, string>> => {
  const nextErrors: Partial<Record<keyof ScheduleInterviewFormValues, string>> = {};

  if (!scheduleFormValues.selectedDateTime) {
    nextErrors.selectedDateTime = JOBS_VALIDATION_MESSAGES.PICK_DATE_TIME;
  }

  if (!scheduleFormValues.interviewerId.trim()) {
    nextErrors.interviewerId = JOBS_VALIDATION_MESSAGES.INTERVIEWER_REQUIRED;
  }

  return nextErrors;
};

export const getJobsErrorMessage = (error: unknown, fallback: string = JOBS_DEFAULT_MESSAGES.API_REQUEST_FAILED): string => {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }

  return fallback;
};
