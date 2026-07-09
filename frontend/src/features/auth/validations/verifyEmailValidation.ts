import { AUTH_FORM_LIMITS } from '../constants/authConstants';
import { AUTH_VALIDATION_MESSAGES } from '../labels/authLabels';
import type { AuthFormErrors, VerifyEmailPayload } from '../types/authTypes';

export const validateVerifyEmailForm = (
  formValues: VerifyEmailPayload,
): AuthFormErrors<VerifyEmailPayload> => {
  const nextErrors: AuthFormErrors<VerifyEmailPayload> = {};

  if (formValues.otp.length !== AUTH_FORM_LIMITS.OTP_LENGTH) {
    nextErrors.otp = AUTH_VALIDATION_MESSAGES.OTP_INVALID_LENGTH;
  }

  return nextErrors;
};
