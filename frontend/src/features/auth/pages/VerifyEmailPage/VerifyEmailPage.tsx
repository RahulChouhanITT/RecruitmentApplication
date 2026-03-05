import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useResendOtpMutation, useVerifyEmailMutation } from "../../api/authApi";
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
import { showToast, TOAST_TYPES } from "../../../../shared/utils/toast";
import { useAppSelector } from "../../../../app/hooks";

const OTP_LENGTH = 6;

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
};

type VerifyLocationState = {
  email?: string;
  autoSendOtp?: boolean;
};

export const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const locationState = (location.state as VerifyLocationState) || {};
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const hasAutoSentOtpRef = useRef(false);
  const emailFromState = locationState.email;
  const email = emailFromState ?? currentUser?.email ?? "";

  const [verifyEmailMutation, { isLoading: isVerifyLoading }] = useVerifyEmailMutation();
  const [resendOtpMutation, { isLoading: isResendLoading }] = useResendOtpMutation();

  useEffect(() => {
    if (!email) {
      navigate("/auth/login", { replace: true });
    }

  }, [email, navigate]);

  useEffect(() => {
    const shouldAutoSendOtp = Boolean(email) && locationState.autoSendOtp === true;

    if (!shouldAutoSendOtp || hasAutoSentOtpRef.current) {
      return;
    }
    hasAutoSentOtpRef.current = true;
    navigate(location.pathname, {
      replace: true,
      state: {
        email,
        autoSendOtp: false,
      },
    });

    const autoSendOtp = async (): Promise<void> => {
      try {
        const response = await resendOtpMutation({ email }).unwrap();

        showToast({
          type: TOAST_TYPES.SUCCESS,
          message: response.message || "OTP sent successfully",
        });
      } catch (error) {
        showToast({
          type: TOAST_TYPES.ERROR,
          message: getErrorMessage(error, "Unable to send OTP"),
        });
      }
    };

    void autoSendOtp();
  }, [locationState.autoSendOtp, email, resendOtpMutation, navigate, location.pathname]);

  const onChangeOtp = (value: string): void => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, OTP_LENGTH);

    setOtp(digitsOnly);

    if (value !== digitsOnly) {
      setOtpError("Only digits are allowed");
      return;
    }

    setOtpError("");
  };

  const onVerifyEmail = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!email) {
      showToast({ type: TOAST_TYPES.ERROR, message: "Email not found. Please register again." });
      return;
    }

    if (otp.length !== OTP_LENGTH) {
      setOtpError("OTP must be 6 digits");
      return;
    }

    try {
      const response = await verifyEmailMutation({
        email,
        otp,
      }).unwrap();

      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: response.message || "Email verified successfully",
      });
      setOtp("");
      setOtpError("");
      navigate("/auth/login", { replace: true });
    } catch (error) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: getErrorMessage(error, "Email verification failed"),
      });
    }
  };

  const onResendOtp = async (): Promise<void> => {
    if (!email) {
      showToast({ type: TOAST_TYPES.ERROR, message: "Email not found. Please register again." });
      return;
    }

    try {
      const response = await resendOtpMutation({ email }).unwrap();

      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: response.message || "OTP resent successfully",
      });
      setOtp("");
      setOtpError("");
    } catch (error) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: getErrorMessage(error, "Unable to resend OTP"),
      });
    }
  };

  return (
    <PageContent>
      <AuthLayout title="Verify your email" subtitle="The verification code has been sent to your email">
        <HelperText>({email || "Email not provided"})</HelperText>

        <Form onSubmit={onVerifyEmail} noValidate>
          <Input
            label="OTP"
            type="text"
            placeholder="Enter 6 digit OTP"
            value={otp}
            onChange={(event) => onChangeOtp(event.target.value)}
            hasError={Boolean(otpError)}
            errorMessage={otpError}
            inputMode="numeric"
            maxLength={OTP_LENGTH}
            required
          />

          <ResendRow>
            <ResendButton
              type="button"
              onClick={onResendOtp}
              disabled={isResendLoading}
            >
              {isResendLoading ? "Sending..." : "Resend OTP"}
            </ResendButton>
          </ResendRow>

          <Button type="submit" disabled={isVerifyLoading}>
            {isVerifyLoading ? "Verifying..." : "Verify Email"}
          </Button>
        </Form>

        <BottomMessage>
          Back to <BackLink to="/auth/register">register page</BackLink>
        </BottomMessage>
      </AuthLayout>
    </PageContent>
  );
};

