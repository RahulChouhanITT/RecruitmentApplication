export const MODEL_DEFAULT_VALUES = {
  EMPTY_STRING: "",
  ZERO: 0,
  FALSE: false,
  TRUE: true,
  NULL: null,
  CURRENT_DATE: Date.now,
} as const;

export const USER_MODEL_CONSTANTS = {
  EMAIL_REGEX: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  PASSWORD_SALT_ROUNDS: 12,
} as const;
