import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../app/hooks";
import { showToast, TOAST_TYPES } from "../../../utils/toast";
import { AUTH_FORM_LIMITS, AUTH_INITIAL_VALUES, AUTH_ROUTE_PATHS } from "../constants/authConstants";
import { AUTH_DEFAULT_MESSAGES, AUTH_VALIDATION_MESSAGES } from "../labels/authLabels";
import { authService } from "../services/authService";
import type { VerifyLocationState } from "../types/authTypes";
import { getAuthErrorMessage } from "../utils/authErrorHandler";

export const useVerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const locationState = (location.state as VerifyLocationState) || {};
  const [otp, setOtp] = useState<string>(AUTH_INITIAL_VALUES.VERIFY_EMAIL.otp);
  const [otpError, setOtpError] = useState<string>(AUTH_INITIAL_VALUES.VERIFY_EMAIL.error);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const hasAutoSentOtpRef = useRef(false);
  const emailFromState = locationState.email;
  const email = emailFromState ?? currentUser?.email ?? AUTH_INITIAL_VALUES.VERIFY_EMAIL.email;

  useEffect(() => {
    if (!email) {
      navigate(AUTH_ROUTE_PATHS.LOGIN, { replace: true });
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
      setIsResendLoading(true);

      try {
        const response = await authService.resendOtp({ email });

        showToast({
          type: TOAST_TYPES.SUCCESS,
          message: response.message || AUTH_DEFAULT_MESSAGES.OTP_SENT_SUCCESS,
        });
      } catch (error) {
        showToast({
          type: TOAST_TYPES.ERROR,
          message: getAuthErrorMessage(error, AUTH_DEFAULT_MESSAGES.SEND_OTP_FAILED),
        });
      } finally {
        setIsResendLoading(false);
      }
    };

    void autoSendOtp();
  }, [locationState.autoSendOtp, email, navigate, location.pathname]);

  const onChangeOtp = (value: string): void => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, AUTH_FORM_LIMITS.OTP_LENGTH);

    setOtp(digitsOnly);

    if (value !== digitsOnly) {
      setOtpError(AUTH_VALIDATION_MESSAGES.OTP_ONLY_DIGITS);
      return;
    }

    setOtpError(AUTH_INITIAL_VALUES.VERIFY_EMAIL.error);
  };

  const onVerifyEmail = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!email) {
      showToast({ type: TOAST_TYPES.ERROR, message: AUTH_DEFAULT_MESSAGES.EMAIL_NOT_FOUND });
      return;
    }

    if (otp.length !== AUTH_FORM_LIMITS.OTP_LENGTH) {
      setOtpError(AUTH_VALIDATION_MESSAGES.OTP_INVALID_LENGTH);
      return;
    }

    setIsVerifyLoading(true);

    try {
      const response = await authService.verifyEmail({
        email,
        otp,
      });

      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: response.message || AUTH_DEFAULT_MESSAGES.EMAIL_VERIFIED_SUCCESS,
      });
      setOtp(AUTH_INITIAL_VALUES.VERIFY_EMAIL.otp);
      setOtpError(AUTH_INITIAL_VALUES.VERIFY_EMAIL.error);
      navigate(AUTH_ROUTE_PATHS.LOGIN, { replace: true });
    } catch (error) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: getAuthErrorMessage(error, AUTH_DEFAULT_MESSAGES.EMAIL_VERIFICATION_FAILED),
      });
    } finally {
      setIsVerifyLoading(false);
    }
  };

  const onResendOtp = async (): Promise<void> => {
    if (!email) {
      showToast({ type: TOAST_TYPES.ERROR, message: AUTH_DEFAULT_MESSAGES.EMAIL_NOT_FOUND });
      return;
    }

    setIsResendLoading(true);

    try {
      const response = await authService.resendOtp({ email });

      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: response.message || AUTH_DEFAULT_MESSAGES.OTP_RESENT_SUCCESS,
      });
      setOtp(AUTH_INITIAL_VALUES.VERIFY_EMAIL.otp);
      setOtpError(AUTH_INITIAL_VALUES.VERIFY_EMAIL.error);
    } catch (error) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: getAuthErrorMessage(error, AUTH_DEFAULT_MESSAGES.RESEND_OTP_FAILED),
      });
    } finally {
      setIsResendLoading(false);
    }
  };

  return {
    email,
    otp,
    otpError,
    isVerifyLoading,
    isResendLoading,
    onChangeOtp,
    onVerifyEmail,
    onResendOtp,
  };
};
