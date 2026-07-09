import { Button } from '../../../../shared/components/Button';
import { Input } from '../../../../shared/components/Input';
import { AUTH_FORM_LIMITS } from '../../constants/authConstants';
import { AUTH_FORM_TEXT, AUTH_UI_TEXT } from '../../labels/authLabels';
import type { LoginFormProps } from '../../types/authTypes';
import { Form } from './LoginForm.styles';

export const LoginForm = ({
  formValues,
  errors,
  handleChange,
  onSubmit,
  isSubmitting = false,
}: LoginFormProps) => {
  return (
    <Form onSubmit={onSubmit} noValidate>
      <Input
        label={AUTH_FORM_TEXT.EMAIL_LABEL}
        type="email"
        placeholder={AUTH_FORM_TEXT.EMAIL_PLACEHOLDER}
        value={formValues.email}
        onChange={(event) => handleChange('email', event.target.value)}
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
        onChange={(event) => handleChange('password', event.target.value)}
        hasError={Boolean(errors.password)}
        errorMessage={errors.password}
        infoMessage={AUTH_FORM_TEXT.PASSWORD_INFO}
        maxLength={AUTH_FORM_LIMITS.MAX_PASSWORD_LENGTH}
        required
      />

      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? AUTH_UI_TEXT.LOGGING_IN_BUTTON : AUTH_UI_TEXT.LOGIN_BUTTON}
      </Button>
    </Form>
  );
};
