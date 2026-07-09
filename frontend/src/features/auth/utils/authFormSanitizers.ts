import { AUTH_FORM_LIMITS, AUTH_INITIAL_VALUES, AUTH_REGEX } from '../constants/authConstants';
import type {
  AuthFormErrors,
  LoginPayload,
  RegisterPayload,
  VerifyEmailPayload,
} from '../types/authTypes';
import { AUTH_VALIDATION_MESSAGES } from '../labels/authLabels';

type SanitizedFieldResult<TValue extends string> = {
  value: TValue;
  error: string;
};

const sanitizeEmailValue = (value: string): SanitizedFieldResult<string> => {
  const normalizedValue = value
    .replace(/\s/g, '')
    .slice(0, AUTH_FORM_LIMITS.MAX_EMAIL_LENGTH)
    .toLowerCase();
  const hasInvalidSpacing = value !== value.replace(/\s/g, '');

  return {
    value: normalizedValue,
    error: hasInvalidSpacing
      ? AUTH_VALIDATION_MESSAGES.EMAIL_NO_SPACES
      : AUTH_INITIAL_VALUES.EMPTY_STRING,
  };
};

const sanitizePasswordValue = (value: string): SanitizedFieldResult<string> => {
  const valueWithoutSpaces = value.replace(/\s/g, '');
  const normalizedValue = valueWithoutSpaces.slice(0, AUTH_FORM_LIMITS.MAX_PASSWORD_LENGTH);
  const hasSpaces = valueWithoutSpaces.length !== value.length;
  const isTrimmed = valueWithoutSpaces.length > AUTH_FORM_LIMITS.MAX_PASSWORD_LENGTH;

  return {
    value: normalizedValue,
    error: hasSpaces
      ? AUTH_VALIDATION_MESSAGES.PASSWORD_NO_SPACES
      : isTrimmed
        ? AUTH_VALIDATION_MESSAGES.PASSWORD_TOO_LONG
        : AUTH_INITIAL_VALUES.EMPTY_STRING,
  };
};

const sanitizeNameValue = (value: string): SanitizedFieldResult<string> => {
  const normalizedValue = value
    .replace(AUTH_REGEX.NAME_SANITIZER, '')
    .slice(0, AUTH_FORM_LIMITS.MAX_NAME_LENGTH);
  const hasInvalidCharacters = value !== normalizedValue;

  return {
    value: normalizedValue,
    error: hasInvalidCharacters
      ? AUTH_VALIDATION_MESSAGES.NAME_ONLY_LETTERS
      : AUTH_INITIAL_VALUES.EMPTY_STRING,
  };
};

const sanitizeOtpValue = (value: string): SanitizedFieldResult<string> => {
  const digitsOnlyValue = value.replace(/\D/g, '').slice(0, AUTH_FORM_LIMITS.OTP_LENGTH);
  const hasInvalidCharacters = value !== digitsOnlyValue;

  return {
    value: digitsOnlyValue,
    error: hasInvalidCharacters
      ? AUTH_VALIDATION_MESSAGES.OTP_ONLY_DIGITS
      : AUTH_INITIAL_VALUES.VERIFY_EMAIL.error,
  };
};

export const sanitizeLoginFormField = <TField extends keyof LoginPayload>(
  field: TField,
  value: LoginPayload[TField],
): {
  value: LoginPayload[TField];
  errors: Partial<AuthFormErrors<LoginPayload>>;
} => {
  if (field === 'email') {
    const result = sanitizeEmailValue(String(value));
    return {
      value: result.value as LoginPayload[TField],
      errors: { email: result.error },
    };
  }

  const result = sanitizePasswordValue(String(value));
  return {
    value: result.value as LoginPayload[TField],
    errors: { password: result.error },
  };
};

export const sanitizeRegisterFormField = <TField extends keyof RegisterPayload>(
  field: TField,
  value: RegisterPayload[TField],
): {
  value: RegisterPayload[TField];
  errors: Partial<AuthFormErrors<RegisterPayload>>;
} => {
  if (field === 'role') {
    return {
      value,
      errors: { role: AUTH_INITIAL_VALUES.EMPTY_STRING },
    };
  }

  if (field === 'fullName') {
    const result = sanitizeNameValue(String(value));
    return {
      value: result.value as RegisterPayload[TField],
      errors: { fullName: result.error },
    };
  }

  if (field === 'email') {
    const result = sanitizeEmailValue(String(value));
    return {
      value: result.value as RegisterPayload[TField],
      errors: { email: result.error },
    };
  }

  const result = sanitizePasswordValue(String(value));
  return {
    value: result.value as RegisterPayload[TField],
    errors: { password: result.error },
  };
};

export const sanitizeVerifyEmailField = <TField extends keyof VerifyEmailPayload>(
  field: TField,
  value: VerifyEmailPayload[TField],
): {
  value: VerifyEmailPayload[TField];
  errors: Partial<AuthFormErrors<VerifyEmailPayload>>;
} => {
  if (field === 'email') {
    const result = sanitizeEmailValue(String(value));
    return {
      value: result.value as VerifyEmailPayload[TField],
      errors: { email: result.error },
    };
  }

  const result = sanitizeOtpValue(String(value));
  return {
    value: result.value as VerifyEmailPayload[TField],
    errors: { otp: result.error },
  };
};
