import { AUTH_FORM_LIMITS, AUTH_REGEX } from '../constants/authConstants';
import { AUTH_VALIDATION_MESSAGES } from '../labels/authLabels';
import type { AuthFormErrors, LoginPayload } from '../types/authTypes';

export const validateLoginForm = (formValues: LoginPayload): AuthFormErrors<LoginPayload> => {
  const nextErrors: AuthFormErrors<LoginPayload> = {};

  if (!formValues.email.trim()) {
    nextErrors.email = AUTH_VALIDATION_MESSAGES.EMAIL_REQUIRED;
  } else if (!AUTH_REGEX.EMAIL.test(formValues.email.trim())) {
    nextErrors.email = AUTH_VALIDATION_MESSAGES.EMAIL_INVALID;
  }

  if (!formValues.password.trim()) {
    nextErrors.password = AUTH_VALIDATION_MESSAGES.PASSWORD_REQUIRED;
  } else if (/\s/.test(formValues.password)) {
    nextErrors.password = AUTH_VALIDATION_MESSAGES.PASSWORD_NO_SPACES;
  } else if (formValues.password.length < AUTH_FORM_LIMITS.MIN_PASSWORD_LENGTH) {
    nextErrors.password = AUTH_VALIDATION_MESSAGES.PASSWORD_TOO_SHORT;
  }

  return nextErrors;
};
