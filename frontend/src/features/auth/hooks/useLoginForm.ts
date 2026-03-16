import { useState } from "react";
import type { FormEvent } from "react";
import { AUTH_FORM_LIMITS, AUTH_INITIAL_VALUES, AUTH_REGEX } from "../constants/authConstants";
import { AUTH_VALIDATION_MESSAGES } from "../labels/authLabels";
import type { LoginPayload } from "../types/authTypes";

export const useLoginForm = (onSubmit?: (values: LoginPayload) => Promise<void> | void) => {
  const [formValues, setFormValues] = useState<LoginPayload>(AUTH_INITIAL_VALUES.LOGIN_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginPayload, string>>>({});

  const validateForm = (): boolean => {
    const nextErrors: Partial<Record<keyof LoginPayload, string>> = {};
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

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onChangeEmail = (value: string): void => {
    const normalizedValue = value.replace(/\s/g, "").slice(0, AUTH_FORM_LIMITS.MAX_EMAIL_LENGTH).toLowerCase();
    const hasInvalidSpacing = value !== value.replace(/\s/g, "");

    setFormValues((previousValue) => ({
      ...previousValue,
      email: normalizedValue,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      email: hasInvalidSpacing ? AUTH_VALIDATION_MESSAGES.EMAIL_NO_SPACES : AUTH_INITIAL_VALUES.EMPTY_STRING,
    }));
  };

  const onChangePassword = (value: string): void => {
    const valueWithoutSpaces = value.replace(/\s/g, "");
    const normalizedValue = valueWithoutSpaces.slice(0, AUTH_FORM_LIMITS.MAX_PASSWORD_LENGTH);
    const hasSpaces = valueWithoutSpaces.length !== value.length;
    const isTrimmed = valueWithoutSpaces.length > AUTH_FORM_LIMITS.MAX_PASSWORD_LENGTH;

    setFormValues((previousValue) => ({
      ...previousValue,
      password: normalizedValue,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      password: hasSpaces
        ? AUTH_VALIDATION_MESSAGES.PASSWORD_NO_SPACES
        : isTrimmed
          ? AUTH_VALIDATION_MESSAGES.PASSWORD_TOO_LONG
          : AUTH_INITIAL_VALUES.EMPTY_STRING,
    }));
  };

  const onFormSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }
    await onSubmit?.(formValues);
  };

  return {
    formValues,
    errors,
    onChangeEmail,
    onChangePassword,
    onFormSubmit,
  };
};
