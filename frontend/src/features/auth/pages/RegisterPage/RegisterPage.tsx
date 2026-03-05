import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/AuthLayout/AuthLayout";
import { RegisterForm } from "../../components/RegisterForm/RegisterForm";
import { useRegisterCandidateMutation } from "../../api/authApi";
import type { RegisterPayload } from "../../types";
import { AuthSwitchLink, AuthSwitchText, PageContent } from "./RegisterPage.styles";
import { showToast, TOAST_TYPES } from "../../../../shared/utils/toast";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [registerCandidateMutation, { isLoading: isRegisterLoading }] = useRegisterCandidateMutation();

  const onRegisterSubmit = async (values: RegisterPayload): Promise<void> => {
    try {
      const response = await registerCandidateMutation(values).unwrap();
      showToast({
        type: TOAST_TYPES.SUCCESS,
        message: response.message || "Registration successful",
      });
      navigate("/auth/verify-email", {
        state: {
          email: values.email,
          autoSendOtp: false,
          startCooldown: true,
        },
      });
    } catch (error) {
      showToast({
        type: TOAST_TYPES.ERROR,
        message: getErrorMessage(error, "Registration failed"),
      });
    }
  };

  return (
    <PageContent>
      <AuthLayout title="Register" subtitle="Register and continue to email verification">
        <RegisterForm onSubmit={onRegisterSubmit} isSubmitting={isRegisterLoading} />
        <AuthSwitchText>
          Already have an account? <AuthSwitchLink to="/auth/login">Login</AuthSwitchLink>
        </AuthSwitchText>
      </AuthLayout>
    </PageContent>
  );
};

