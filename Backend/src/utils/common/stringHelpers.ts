import { APPLICATION_CONSTANTS } from "../constants/applicationConstants";
import { ApplicationError } from "../errors/applicationError";

export const trimValue = (value?: string | null): string =>
  value?.trim() ?? APPLICATION_CONSTANTS.EMPTY_STRING;

export const trimOrEmpty = (value?: string | null): string => trimValue(value);

export const normalizeEmailAddress = (email: string): string => trimValue(email).toLowerCase();

export const normalizeUppercaseValue = (value?: string | null): string => trimValue(value).toUpperCase();

export const normalizeStatusValue = (value: string): string =>
  normalizeUppercaseValue(value).replace(/\s+/g, "_");

export const requireTrimmedValue = (
  value: string | undefined | null,
  message: string,
  statusCode: number = APPLICATION_CONSTANTS.HTTP_STATUS_CODES.BAD_REQUEST
): string => {
  const trimmedValue = trimValue(value);
  if (!trimmedValue) {
    throw new ApplicationError(message, statusCode);
  }

  return trimmedValue;
};

export const normalizeOptionalString = (value?: string | object): string | undefined => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "object" && value !== null) {
    return String(value).trim();
  }

  return undefined;
};
