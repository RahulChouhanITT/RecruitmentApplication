import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/AuthLayout/AuthLayout";
import { LoginForm } from "../../components/LoginForm/LoginForm";
import { useLoginMutation, useLazyGetCurrentUserQuery } from "../../api/authApi";
import { setCurrentUser } from "../../state/authSlice";
import type { LoginPayload } from "../../types";
import { useAppDispatch } from "../../../../app/hooks";
import { AuthSwitchLink, AuthSwitchText, PageContent } from "./LoginPage.styles";
import { showToast, TOAST_TYPES } from "../../../../shared/utils/toast";
import { AuthModal } from "../../components/AuthModal/AuthModal";
import { AUTH_BLOCKING_ERROR_MATCHERS } from "../../constants";

type ModalState = {
  open: boolean;
  title: string;
  message: string;
  primaryLabel?: string;
  primaryAction?: "verify_email";
  email?: string;
};

const initialModalState: ModalState = {
  open: false,
  title: "",
  message: "",
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
};

const includesAny = (message: string, candidates: string[]): boolean => {
  const normalizedMessage = message.toLowerCase();
  return candidates.some((candidate) => normalizedMessage.includes(candidate));
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [modalState, setModalState] = useState<ModalState>(initialModalState);

  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [getCurrentUser, { isFetching: isCurrentUserFetching }] = useLazyGetCurrentUserQuery();

  const onCloseModal = (): void => {
    setModalState(initialModalState);
  };

  const onPrimaryModalAction = (): void => {
    if (modalState.primaryAction === "verify_email" && modalState.email) {
      navigate("/auth/verify-email", {
        state: {
          email: modalState.email,
          autoSendOtp: true,
        },
      });
    }
    onCloseModal();
  };

  const onLoginSubmit = async (values: LoginPayload): Promise<void> => {
    try {
      const loginResponse = await loginMutation(values).unwrap();
      const meResponse = await getCurrentUser().unwrap();

      if (meResponse.data) {
        dispatch(setCurrentUser(meResponse.data));
      }

      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: loginResponse.message || "Login successful",
      });
      navigate("/dashboard");
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Login failed");

      if (includesAny(errorMessage, AUTH_BLOCKING_ERROR_MATCHERS.NOT_VERIFIED)) {
        setModalState({
          open: true,
          title: "Email verification pending",
          message: "Please verify your email with OTP before login.",
          primaryLabel: "Verify Email",
          primaryAction: "verify_email",
          email: values.email,
        });
        return;
      }

      if (includesAny(errorMessage, AUTH_BLOCKING_ERROR_MATCHERS.NOT_APPROVED)) {
        setModalState({
          open: true,
          title: "Account approval pending",
          message: "Your account is waiting for approval. Please try again after approval.",
        });
        return;
      }

      showToast({
        type: TOAST_TYPES.ERROR,
        message: errorMessage,
      });
    }
  };

  return (
    <PageContent>
      <AuthLayout title="Login" subtitle="Login to continue">
        <LoginForm
          onSubmit={onLoginSubmit}
          isSubmitting={isLoginLoading || isCurrentUserFetching}
        />
        <AuthSwitchText>
          Don&apos;t have an account? <AuthSwitchLink to="/auth/register">Register</AuthSwitchLink>
        </AuthSwitchText>
      </AuthLayout>

      <AuthModal
        isOpen={modalState.open}
        title={modalState.title}
        message={modalState.message}
        onClose={onCloseModal}
        closeLabel="Cancel"
        primaryLabel={modalState.primaryLabel}
        onPrimaryAction={modalState.primaryLabel ? onPrimaryModalAction : undefined}
      />
    </PageContent>
  );
};

