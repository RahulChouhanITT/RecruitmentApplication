import { Button } from "../../../../shared/components/Button/Button";
import { Input } from "../../../../shared/components/Input/Input";
import { AUTH_FORM_LIMITS } from "../../constants/authConstants";
import { AUTH_FORM_TEXT, AUTH_UI_TEXT } from "../../labels/authLabels";
import type { AuthRole, RegisterFormProps } from "../../types/authTypes";
import { ErrorText, Form, InputGroup, Label, Select } from "./RegisterForm.styles";

export const RegisterForm = ({
  formValues,
  errors,
  onChangeRole,
  onChangeName,
  onChangeEmail,
  onChangePassword,
  onSubmit,
  isSubmitting = false,
}: RegisterFormProps) => {
  return (
    <Form onSubmit={onSubmit} noValidate>
      <InputGroup>
        <Label htmlFor="role">{AUTH_FORM_TEXT.ROLE_LABEL}</Label>
        <Select
          id="role"
          value={formValues.role}
          onChange={(event) => onChangeRole(event.target.value as AuthRole)}
          $hasError={Boolean(errors.role)}
          required
        >
          <option value="hr">{AUTH_FORM_TEXT.ROLE_OPTIONS.HR}</option>
          <option value="candidate">{AUTH_FORM_TEXT.ROLE_OPTIONS.CANDIDATE}</option>
          <option value="interviewer">{AUTH_FORM_TEXT.ROLE_OPTIONS.INTERVIEWER}</option>
        </Select>
        <ErrorText $visible={Boolean(errors.role)}>{errors.role || "\u00A0"}</ErrorText>
      </InputGroup>

      <Input
        label={AUTH_FORM_TEXT.NAME_LABEL}
        type="text"
        placeholder={AUTH_FORM_TEXT.NAME_PLACEHOLDER}
        value={formValues.fullName}
        onChange={(event) => onChangeName(event.target.value)}
        hasError={Boolean(errors.fullName)}
        errorMessage={errors.fullName}
        maxLength={AUTH_FORM_LIMITS.MAX_NAME_LENGTH}
        required
      />

      <Input
        label={AUTH_FORM_TEXT.EMAIL_LABEL}
        type="email"
        placeholder={AUTH_FORM_TEXT.EMAIL_PLACEHOLDER}
        value={formValues.email}
        onChange={(event) => onChangeEmail(event.target.value)}
        hasError={Boolean(errors.email)}
        errorMessage={errors.email}
        maxLength={AUTH_FORM_LIMITS.MAX_EMAIL_LENGTH}
        required
      />

      <Input
        label={AUTH_FORM_TEXT.PASSWORD_LABEL}
        type="password"
        placeholder={AUTH_FORM_TEXT.PASSWORD_PLACEHOLDER}
        value={formValues.password}
        onChange={(event) => onChangePassword(event.target.value)}
        hasError={Boolean(errors.password)}
        errorMessage={errors.password}
        infoMessage={AUTH_FORM_TEXT.PASSWORD_INFO}
        maxLength={AUTH_FORM_LIMITS.MAX_PASSWORD_LENGTH}
        required
      />

      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? AUTH_UI_TEXT.REGISTERING_BUTTON : AUTH_UI_TEXT.REGISTER_BUTTON}
      </Button>
    </Form>
  );
};
