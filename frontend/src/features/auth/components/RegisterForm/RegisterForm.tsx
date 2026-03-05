import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../../../../shared/components/Button/Button";
import { Input } from "../../../../shared/components/Input/Input";
import type { AuthRole, RegisterPayload } from "../../types";
import { ErrorText, Form, InputGroup, Label, Select } from "./RegisterForm.styles";

type RegisterFormProps = {
  onSubmit?: (values: RegisterPayload) => Promise<void> | void;
  isSubmitting?: boolean;
};

const MAX_NAME_LENGTH = 60;
const MAX_EMAIL_LENGTH = 100;
const MAX_PASSWORD_LENGTH = 64;

export const RegisterForm = ({ onSubmit, isSubmitting = false }: RegisterFormProps) => {
  const [formValues, setFormValues] = useState<RegisterPayload>({
    role: "candidate",
    fullName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterPayload, string>>>({});

  const validateForm = (): boolean => {
    const nextErrors: Partial<Record<keyof RegisterPayload, string>> = {};
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).{8,}$/;

    if (!formValues.role) {
      nextErrors.role = "Role is required";
    }

    if (!formValues.fullName.trim()) {
      nextErrors.fullName = "Name is required";
    } else if (formValues.fullName.trim().length < 2) {
      nextErrors.fullName = "Please enter full name like Rahul Chouhan";
    }

    if (!formValues.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!emailRegex.test(formValues.email.trim())) {
      nextErrors.email = "Please enter valid email like example@gmail.com";
    }

    if (!formValues.password.trim()) {
      nextErrors.password = "Password is required";
    } else if (!passwordRegex.test(formValues.password)) {
      nextErrors.password =
        "Use password like Example@123 (upper, lower, number, min 8)";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onChangeRole = (value: AuthRole): void => {
    setFormValues((previousValue) => ({
      ...previousValue,
      role: value,
    }));
    setErrors((previousErrors) => ({
      ...previousErrors,
      role: "",
    }));
  };

  const onChangeName = (value: string): void => {
    const normalizedValue = value.replace(/[^A-Za-z\s]/g, "").slice(0, MAX_NAME_LENGTH);
    const hasInvalidCharacters = value !== normalizedValue;

    setFormValues((previousValue) => ({
      ...previousValue,
      fullName: normalizedValue,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      fullName: hasInvalidCharacters ? "Only letters and spaces are allowed" : "",
    }));
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
      <InputGroup>
        <Label htmlFor="role">Role</Label>
        <Select
          id="role"
          value={formValues.role}
          onChange={(event) => onChangeRole(event.target.value as AuthRole)}
          $hasError={Boolean(errors.role)}
          required
        >
          <option value="hr">HR</option>
          <option value="candidate">Candidate</option>
          <option value="interviewer">Interviewer</option>
        </Select>
        <ErrorText $visible={Boolean(errors.role)}>{errors.role || "\u00A0"}</ErrorText>
      </InputGroup>

      <Input
        label="Name"
        type="text"
        placeholder="Rahul Chouhan"
        value={formValues.fullName}
        onChange={(event) => onChangeName(event.target.value)}
        hasError={Boolean(errors.fullName)}
        errorMessage={errors.fullName}
        maxLength={MAX_NAME_LENGTH}
        required
      />

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
        {isSubmitting ? "Registering..." : "Register"}
      </Button>
    </Form>
  );
};
