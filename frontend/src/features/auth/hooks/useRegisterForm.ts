import { useState } from 'react';
import type { FormEvent } from 'react';
import { AUTH_INITIAL_VALUES } from '../constants/authConstants';
import { sanitizeRegisterFormField } from '../utils/authFormSanitizers';
import { validateRegisterForm } from '../validations';
import type { AuthFormChangeHandler, AuthFormErrors, RegisterPayload } from '../types/authTypes';

export const useRegisterForm = (onSubmit?: (values: RegisterPayload) => Promise<void> | void) => {
  const [formValues, setFormValues] = useState<RegisterPayload>(AUTH_INITIAL_VALUES.REGISTER_FORM);
  const [errors, setErrors] = useState<AuthFormErrors<RegisterPayload>>({});

  const validateForm = (): boolean => {
    const nextErrors = validateRegisterForm(formValues);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange: AuthFormChangeHandler<RegisterPayload> = (field, value): void => {
    const sanitizedField = sanitizeRegisterFormField(field, value);

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
