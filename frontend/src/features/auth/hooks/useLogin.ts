import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../app/hooks';
import { showToast, TOAST_TYPES } from '../../../utils/toast';
import { AUTH_INITIAL_VALUES, AUTH_ROUTE_PATHS } from '../constants/authConstants';
import { AUTH_DEFAULT_MESSAGES } from '../labels/authLabels';
import { setCurrentUser } from '../state/authSlice';
import type { LoginPageModalState, LoginPayload } from '../types/authTypes';
import {
  buildLoginBlockingModalState,
  buildVerifyEmailNavigationState,
  getAuthErrorMessage,
  shouldTreatAsInlineAuthError,
} from '../handlers';
import { loginUser } from '../usecases';

const initialModalState: LoginPageModalState = AUTH_INITIAL_VALUES.LOGIN_MODAL_STATE;

export const useLogin = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalState, setModalState] = useState<LoginPageModalState>(initialModalState);

  const closeModal = (): void => {
    setModalState(initialModalState);
  };

  const onPrimaryModalAction = (): void => {
    if (modalState.primaryAction === 'verify_email' && modalState.email) {
      const verifyEmailNavigation = buildVerifyEmailNavigationState(modalState.email);
      navigate(verifyEmailNavigation.pathname, { state: verifyEmailNavigation.state });
    }
    closeModal();
  };

  const submitLogin = async (values: LoginPayload): Promise<void> => {
    setIsSubmitting(true);

    try {
      const { loginResponse, currentUserResponse } = await loginUser(values);

      if (currentUserResponse.data) {
        dispatch(setCurrentUser(currentUserResponse.data));
      }

      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: loginResponse.message || AUTH_DEFAULT_MESSAGES.LOGIN_SUCCESS,
      });
      navigate(AUTH_ROUTE_PATHS.DASHBOARD);
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error, AUTH_DEFAULT_MESSAGES.LOGIN_FAILED);
      const blockingModalState = buildLoginBlockingModalState(errorMessage, values.email);

      if (blockingModalState) {
        setModalState(blockingModalState);
        return;
      }

      showToast({
        type: TOAST_TYPES.ERROR,
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExternalAuthError = useCallback((errorMessage: string): void => {
    const blockingModalState = buildLoginBlockingModalState(errorMessage, '');
    if (blockingModalState) {
      setModalState(blockingModalState);
      return;
    }

    if (shouldTreatAsInlineAuthError(errorMessage)) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: errorMessage,
      });
      return;
    }

    showToast({
      type: TOAST_TYPES.ERROR,
      message: errorMessage,
    });
  }, []);

  return {
    isSubmitting,
    modalState,
    closeModal,
    handleExternalAuthError,
    onPrimaryModalAction,
    submitLogin,
  };
};
