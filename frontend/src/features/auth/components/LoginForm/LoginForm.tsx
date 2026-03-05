import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../../../shared/components/Button/Button";
import { Input } from "../../../../shared/components/Input/Input";
import type { LoginPayload } from "../../types";
import { Form } from "./LoginForm.styles";

type LoginFormProps = {
  onSubmit?: (values: LoginPayload) => Promise<void> | void;
  isSubmitting?: boolean;
};

const MAX_EMAIL_LENGTH = 100;
const MAX_PASSWORD_LENGTH = 64;

export const LoginForm = ({ onSubmit, isSubmitting = false }: LoginFormProps) => {
  const [formValues, setFormValues] = useState<LoginPayload>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginPayload, string>>>({});

  const validateForm = (): boolean => {
    const nextErrors: Partial<Record<keyof LoginPayload, string>> = {};
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!formValues.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!emailRegex.test(formValues.email.trim())) {
      nextErrors.email = "Please enter valid email like example@gmail.com";
    }

    if (!formValues.password.trim()) {
      nextErrors.password = "Password is required";
    } else if (/\s/.test(formValues.password)) {
      nextErrors.password = "Password cannot contain spaces";
    } else if (formValues.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onChangeEmail = (value: string): void => {
    const normalizedValue = value.replace(/\s/g, "").slice(0, MAX_EMAIL_LENGTH).toLowerCase();
    const hasInvalidSpacing = value !== value.replace(/\s/g, "");

    setFormValues((previousValue) => ({
      ...previousValue,
      email: normalizedValue,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      email: hasInvalidSpacing ? "Email cannot contain spaces" : "",
    }));
  };

  const onChangePassword = (value: string): void => {
    const valueWithoutSpaces = value.replace(/\s/g, "");
    const normalizedValue = valueWithoutSpaces.slice(0, MAX_PASSWORD_LENGTH);
    const hasSpaces = valueWithoutSpaces.length !== value.length;
    const isTrimmed = valueWithoutSpaces.length > MAX_PASSWORD_LENGTH;

    setFormValues((previousValue) => ({
      ...previousValue,
      password: normalizedValue,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      password: hasSpaces
        ? "Password cannot contain spaces"
        : isTrimmed
          ? "Password is too long"
          : "",
    }));
  };

  const onFormSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }
    await onSubmit?.(formValues);
  };

  return (
    <Form onSubmit={onFormSubmit} noValidate>
      <Input
        label="Email"
        type="email"
        placeholder="example@gmail.com"
        value={formValues.email}
        onChange={(event) => onChangeEmail(event.target.value)}
        hasError={Boolean(errors.email)}
        errorMessage={errors.email}
        maxLength={MAX_EMAIL_LENGTH}
        required
      />

      <Input
        label="Password"
        type="password"
        placeholder="Example@123"
        value={formValues.password}
        onChange={(event) => onChangePassword(event.target.value)}
        hasError={Boolean(errors.password)}
        errorMessage={errors.password}
        infoMessage="Use at least 8 characters with uppercase, lowercase, and number."
        maxLength={MAX_PASSWORD_LENGTH}
        required
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
      </Button>
    </Form>
  );
};
