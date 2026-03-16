import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../app/hooks";
import { showToast, TOAST_TYPES } from "../../../utils/toast";
import { AUTH_BLOCKING_ERROR_MATCHERS, AUTH_INITIAL_VALUES, AUTH_ROUTE_PATHS } from "../constants/authConstants";
import { AUTH_DEFAULT_MESSAGES, AUTH_UI_TEXT } from "../labels/authLabels";
import { authService } from "../services/authService";
import { setCurrentUser } from "../state/authSlice";
import type { LoginPageModalState, LoginPayload } from "../types/authTypes";
import { getAuthErrorMessage } from "../utils/authErrorHandler";
import { includesAnyAuthError } from "../utils/authHelpers";

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
    if (modalState.primaryAction === "verify_email" && modalState.email) {
      navigate(AUTH_ROUTE_PATHS.VERIFY_EMAIL, {
        state: {
          email: modalState.email,
          autoSendOtp: true,
        },
      });
    }
    closeModal();
  };

  const submitLogin = async (values: LoginPayload): Promise<void> => {
    setIsSubmitting(true);

    try {
      const loginResponse = await authService.login(values);
      const meResponse = await authService.getCurrentUser();

      if (meResponse.data) {
        dispatch(setCurrentUser(meResponse.data));
      }

      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: loginResponse.message || AUTH_DEFAULT_MESSAGES.LOGIN_SUCCESS,
      });
      navigate(AUTH_ROUTE_PATHS.DASHBOARD);
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error, AUTH_DEFAULT_MESSAGES.LOGIN_FAILED);

      if (includesAnyAuthError(errorMessage, AUTH_BLOCKING_ERROR_MATCHERS.NOT_VERIFIED)) {
        setModalState({
          open: true,
          title: AUTH_UI_TEXT.VERIFY_EMAIL_PENDING_TITLE,
          message: AUTH_UI_TEXT.VERIFY_EMAIL_PENDING_MESSAGE,
          primaryLabel: AUTH_UI_TEXT.VERIFY_EMAIL_PENDING_PRIMARY_LABEL,
          primaryAction: "verify_email",
          email: values.email,
        });
        return;
      }

      if (includesAnyAuthError(errorMessage, AUTH_BLOCKING_ERROR_MATCHERS.NOT_APPROVED)) {
        setModalState({
          open: true,
          title: AUTH_UI_TEXT.APPROVAL_PENDING_TITLE,
          message: AUTH_UI_TEXT.APPROVAL_PENDING_MESSAGE,
        });
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

  return {
    isSubmitting,
    modalState,
    closeModal,
    onPrimaryModalAction,
    submitLogin,
  };
};
