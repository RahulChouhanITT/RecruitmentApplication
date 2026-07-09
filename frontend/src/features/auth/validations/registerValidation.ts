import { AUTH_REGEX } from '../constants/authConstants';
import { AUTH_VALIDATION_MESSAGES } from '../labels/authLabels';
import type { AuthFormErrors, RegisterPayload } from '../types/authTypes';

export const validateRegisterForm = (
  formValues: RegisterPayload,
): AuthFormErrors<RegisterPayload> => {
  const nextErrors: AuthFormErrors<RegisterPayload> = {};

  if (!formValues.role) {
    nextErrors.role = AUTH_VALIDATION_MESSAGES.ROLE_REQUIRED;
  }

  if (!formValues.fullName.trim()) {
    nextErrors.fullName = AUTH_VALIDATION_MESSAGES.NAME_REQUIRED;
  } else if (formValues.fullName.trim().length < 2) {
    nextErrors.fullName = AUTH_VALIDATION_MESSAGES.NAME_INVALID;
  }

  if (!formValues.email.trim()) {
    nextErrors.email = AUTH_VALIDATION_MESSAGES.EMAIL_REQUIRED;
  } else if (!AUTH_REGEX.EMAIL.test(formValues.email.trim())) {
    nextErrors.email = AUTH_VALIDATION_MESSAGES.EMAIL_INVALID;
  }

  if (!formValues.password.trim()) {
    nextErrors.password = AUTH_VALIDATION_MESSAGES.PASSWORD_REQUIRED;
  } else if (!AUTH_REGEX.PASSWORD.test(formValues.password)) {
    nextErrors.password = AUTH_VALIDATION_MESSAGES.PASSWORD_INVALID;
  }

  return nextErrors;
};
