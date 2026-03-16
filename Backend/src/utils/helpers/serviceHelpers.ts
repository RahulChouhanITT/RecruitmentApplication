import { ApplicationError } from "../errors/applicationError";
import { APPLICATION_CONSTANTS } from "../constants/applicationConstants";
import { APPLICATION_STATUSES } from "../types/applicationTypes";
import { INTERVIEW_STATUSES } from "../../models/interviewModel";

export const trimValue = (value?: string | null): string => value?.trim() ?? "";

export const trimOrEmpty = (value?: string | null): string => trimValue(value);

export const normalizeEmailAddress = (email: string): string => trimValue(email).toLowerCase();

export const normalizeUppercaseValue = (value?: string | null): string => trimValue(value).toUpperCase();

export const normalizeStatusValue = (value: string): string =>
  normalizeUppercaseValue(value).replace(/\s+/g, "_");

export const requireTrimmedValue = (
  value: string | undefined | null,
  message: string,
  statusCode = 400
): string => {
  const trimmedValue = trimValue(value);
  if (!trimmedValue) {
    throw new ApplicationError(message, statusCode);
  }

  return trimmedValue;
};

export const ensureEntity = <T>(
  entity: T | null | undefined,
  message: string,
  statusCode = 404
): NonNullable<T> => {
  if (!entity) {
    throw new ApplicationError(message, statusCode);
  }

  return entity as NonNullable<T>;
};

export function assertEntityExists<T>(
  entity: T | null | undefined,
  message: string,
  statusCode = 404
): asserts entity is NonNullable<T> {
  if (!entity) {
    throw new ApplicationError(message, statusCode);
  }
}

export const toIdString = (value?: { toString(): string } | string | null): string =>
  typeof value === "string" ? value : value?.toString() ?? "";

export const resolveInterviewFeedbackStatus = (
  feedbackStatus: string | undefined,
  interviewStatus: string | undefined,
  applicationStatus?: string | undefined
): "PENDING" | "NEEDS_REVIEW" | "REVIEWED" => {
  const normalizedFeedbackStatus = normalizeUppercaseValue(feedbackStatus);
  if (
    normalizedFeedbackStatus === APPLICATION_CONSTANTS.FEEDBACK_STATUSES[0] ||
    normalizedFeedbackStatus === APPLICATION_CONSTANTS.FEEDBACK_STATUSES[1] ||
    normalizedFeedbackStatus === APPLICATION_CONSTANTS.FEEDBACK_STATUSES[2]
  ) {
    return normalizedFeedbackStatus;
  }

  const normalizedApplicationStatus = normalizeUppercaseValue(applicationStatus);
  if (normalizedApplicationStatus === APPLICATION_STATUSES[3] || normalizedApplicationStatus === APPLICATION_STATUSES[4]) {
    return APPLICATION_CONSTANTS.FEEDBACK_STATUSES[2];
  }

  const normalizedInterviewStatus = normalizeUppercaseValue(interviewStatus);
  if (normalizedInterviewStatus === INTERVIEW_STATUSES[1]) {
    return APPLICATION_CONSTANTS.FEEDBACK_STATUSES[1];
  }

  return APPLICATION_CONSTANTS.FEEDBACK_STATUSES[0];
};

export const isCloudinaryEnvironmentConfigured = (): boolean => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
};
