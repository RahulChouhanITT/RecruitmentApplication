import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast, TOAST_TYPES } from '../../../utils/toast';
import { AUTH_ROUTE_PATHS } from '../constants/authConstants';
import { AUTH_DEFAULT_MESSAGES } from '../labels/authLabels';
import type { RegisterPayload } from '../types/authTypes';
import { getAuthErrorMessage } from '../handlers';
import { registerUser } from '../usecases';

export const useRegister = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitRegister = async (values: RegisterPayload): Promise<void> => {
    setIsSubmitting(true);

    try {
      const response = await registerUser(values);
      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: response.message || AUTH_DEFAULT_MESSAGES.REGISTRATION_SUCCESS,
      });
      navigate(AUTH_ROUTE_PATHS.VERIFY_EMAIL, {
        state: {
          email: values.email,
          autoSendOtp: false,
          startCooldown: true,
        },
      });
    } catch (error) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: getAuthErrorMessage(error, AUTH_DEFAULT_MESSAGES.REGISTRATION_FAILED),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitRegister,
  };
};
