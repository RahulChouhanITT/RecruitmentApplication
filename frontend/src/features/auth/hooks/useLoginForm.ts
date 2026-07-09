import { useState } from 'react';
import type { FormEvent } from 'react';
import { AUTH_INITIAL_VALUES } from '../constants/authConstants';
import { sanitizeLoginFormField } from '../utils/authFormSanitizers';
import { validateLoginForm } from '../validations';
import type { AuthFormChangeHandler, AuthFormErrors, LoginPayload } from '../types/authTypes';

export const useLoginForm = (onSubmit?: (values: LoginPayload) => Promise<void> | void) => {
  const [formValues, setFormValues] = useState<LoginPayload>(AUTH_INITIAL_VALUES.LOGIN_FORM);
  const [errors, setErrors] = useState<AuthFormErrors<LoginPayload>>({});

  const validateForm = (): boolean => {
    const nextErrors = validateLoginForm(formValues);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange: AuthFormChangeHandler<LoginPayload> = (field, value): void => {
    const sanitizedField = sanitizeLoginFormField(field, value);

    setFormValues((previousValue) => ({
      ...previousValue,
      [field]: sanitizedField.value,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      ...sanitizedField.errors,
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
    handleChange,
    onFormSubmit,
  };
};
