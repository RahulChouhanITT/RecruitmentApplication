import { AUTH_FORM_LIMITS, AUTH_ROUTE_PATHS } from "../../constants/authConstants";
import { AUTH_FORM_TEXT, AUTH_UI_TEXT } from "../../labels/authLabels";
import { useVerifyEmail } from "../../hooks/useVerifyEmail";
import { Button } from "../../../../shared/components/Button/Button";
import { Input } from "../../../../shared/components/Input/Input";
import { AuthLayout } from "../../components/AuthLayout/AuthLayout";
import {
  BackLink,
  BottomMessage,
  Form,
  HelperText,
  PageContent,
  ResendButton,
  ResendRow,
} from "./VerifyEmailPage.styles";

export const VerifyEmailPage = () => {
  const { email, otp, otpError, isVerifyLoading, isResendLoading, onChangeOtp, onVerifyEmail, onResendOtp } =
    useVerifyEmail();

  return (
    <PageContent>
      <AuthLayout title={AUTH_UI_TEXT.VERIFY_EMAIL_TITLE} subtitle={AUTH_UI_TEXT.VERIFY_EMAIL_SUBTITLE}>
        <HelperText>({email || AUTH_UI_TEXT.VERIFY_EMAIL_HELPER_FALLBACK})</HelperText>

        <Form onSubmit={onVerifyEmail} noValidate>
          <Input
            label={AUTH_FORM_TEXT.OTP_LABEL}
            type="text"
            placeholder={AUTH_FORM_TEXT.OTP_PLACEHOLDER}
            value={otp}
            onChange={(event) => onChangeOtp(event.target.value)}
            hasError={Boolean(otpError)}
            errorMessage={otpError}
            inputMode="numeric"
            maxLength={AUTH_FORM_LIMITS.OTP_LENGTH}
            required
          />

          <ResendRow>
            <ResendButton
              type="button"
              onClick={onResendOtp}
              disabled={isResendLoading}
            >
              {isResendLoading ? AUTH_UI_TEXT.SENDING_BUTTON : AUTH_UI_TEXT.RESEND_OTP_BUTTON}
            </ResendButton>
          </ResendRow>

          <Button type="submit" isLoading={isVerifyLoading}>
            {isVerifyLoading ? AUTH_UI_TEXT.VERIFYING_BUTTON : AUTH_UI_TEXT.VERIFY_EMAIL_BUTTON}
          </Button>
        </Form>

        <BottomMessage>
          Back to <BackLink to={AUTH_ROUTE_PATHS.REGISTER}>{AUTH_UI_TEXT.VERIFY_EMAIL_BACK_TEXT}</BackLink>
        </BottomMessage>
      </AuthLayout>
    </PageContent>
  );
};

