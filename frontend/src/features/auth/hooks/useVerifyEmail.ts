import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks';
import { showToast, TOAST_TYPES } from '../../../utils/toast';
import { AUTH_INITIAL_VALUES, AUTH_ROUTE_PATHS } from '../constants/authConstants';
import { AUTH_DEFAULT_MESSAGES } from '../labels/authLabels';
import { sanitizeVerifyEmailField } from '../utils/authFormSanitizers';
import { validateVerifyEmailForm } from '../validations';
import type {
  AuthFormChangeHandler,
  AuthFormErrors,
  VerifyEmailPayload,
  VerifyLocationState,
} from '../types/authTypes';
import { getAuthErrorMessage } from '../handlers';
import { resendEmailOtp, verifyEmailOtp } from '../usecases';

export const useVerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const locationState = (location.state as VerifyLocationState) || {};
  const [formValues, setFormValues] = useState<VerifyEmailPayload>({
    email: AUTH_INITIAL_VALUES.VERIFY_EMAIL.email,
    otp: AUTH_INITIAL_VALUES.VERIFY_EMAIL.otp,
  });
  const [errors, setErrors] = useState<AuthFormErrors<VerifyEmailPayload>>({});
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
        const response = await resendEmailOtp({ email });

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

  const handleChange: AuthFormChangeHandler<VerifyEmailPayload> = (field, value): void => {
    const sanitizedField = sanitizeVerifyEmailField(field, value);

    setFormValues((previousValue) => ({
      ...previousValue,
      [field]: sanitizedField.value,
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      ...sanitizedField.errors,
    }));
  };

  const onVerifyEmail = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!email) {
      showToast({ type: TOAST_TYPES.ERROR, message: AUTH_DEFAULT_MESSAGES.EMAIL_NOT_FOUND });
      return;
    }

    const nextErrors = validateVerifyEmailForm({
      email,
      otp: formValues.otp,
    });
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsVerifyLoading(true);

    try {
      const response = await verifyEmailOtp({
        email,
        otp: formValues.otp,
      });

      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: response.message || AUTH_DEFAULT_MESSAGES.EMAIL_VERIFIED_SUCCESS,
      });
      setFormValues({
        email: AUTH_INITIAL_VALUES.VERIFY_EMAIL.email,
        otp: AUTH_INITIAL_VALUES.VERIFY_EMAIL.otp,
      });
      setErrors({});
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
      const response = await resendEmailOtp({ email });

      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: response.message || AUTH_DEFAULT_MESSAGES.OTP_RESENT_SUCCESS,
      });
      setFormValues((previousValue) => ({
        ...previousValue,
        otp: AUTH_INITIAL_VALUES.VERIFY_EMAIL.otp,
      }));
      setErrors({});
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
    otp: formValues.otp,
    otpError: errors.otp ?? AUTH_INITIAL_VALUES.VERIFY_EMAIL.error,
    isVerifyLoading,
    isResendLoading,
    handleChange,
    onVerifyEmail,
    onResendOtp,
  };
};
