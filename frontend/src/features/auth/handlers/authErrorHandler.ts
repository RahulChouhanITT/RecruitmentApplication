import {
  AUTH_BLOCKING_ERROR_MATCHERS,
  AUTH_ROUTE_PATHS,
} from '../constants/authConstants';
import { AUTH_UI_TEXT } from '../labels/authLabels';
import type { LoginPageModalState } from '../types/authTypes';

const includesAnyAuthError = (message: string, candidates: string[]): boolean => {
  const normalizedMessage = message.toLowerCase();
  return candidates.some((candidate) => normalizedMessage.includes(candidate));
};

export const getAuthErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }

  return fallback;
};

export const buildLoginBlockingModalState = (
  errorMessage: string,
  email: string,
): LoginPageModalState | null => {
  if (includesAnyAuthError(errorMessage, AUTH_BLOCKING_ERROR_MATCHERS.NOT_VERIFIED)) {
    return {
      open: true,
      title: AUTH_UI_TEXT.VERIFY_EMAIL_PENDING_TITLE,
      message: AUTH_UI_TEXT.VERIFY_EMAIL_PENDING_MESSAGE,
      primaryLabel: AUTH_UI_TEXT.VERIFY_EMAIL_PENDING_PRIMARY_LABEL,
      primaryAction: 'verify_email',
      email,
    };
  }

  if (includesAnyAuthError(errorMessage, AUTH_BLOCKING_ERROR_MATCHERS.NOT_APPROVED)) {
    return {
      open: true,
      title: AUTH_UI_TEXT.APPROVAL_PENDING_TITLE,
      message: AUTH_UI_TEXT.APPROVAL_PENDING_MESSAGE,
    };
  }

  return null;
};

export const buildVerifyEmailNavigationState = (email: string) => ({
  pathname: AUTH_ROUTE_PATHS.VERIFY_EMAIL,
  state: {
    email,
    autoSendOtp: true,
  },
});

export const shouldTreatAsInlineAuthError = (errorMessage: string): boolean => {
  return includesAnyAuthError(errorMessage, AUTH_BLOCKING_ERROR_MATCHERS.GOOGLE_REQUIRED);
};
