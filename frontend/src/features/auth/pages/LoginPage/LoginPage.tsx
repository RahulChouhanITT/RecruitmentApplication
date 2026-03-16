import { AuthLayout } from "../../components/AuthLayout/AuthLayout";
import { LoginForm } from "../../components/LoginForm/LoginForm";
import { AUTH_ROUTE_PATHS } from "../../constants/authConstants";
import { AUTH_UI_TEXT } from "../../labels/authLabels";
import { useLogin } from "../../hooks/useLogin";
import { useLoginForm } from "../../hooks/useLoginForm";
import { AuthSwitchLink, AuthSwitchText, PageContent } from "./LoginPage.styles";
import { AuthModal } from "../../components/AuthModal/AuthModal";

export const LoginPage = () => {
  const { isSubmitting, modalState, closeModal, onPrimaryModalAction, submitLogin } = useLogin();
  const { formValues, errors, onChangeEmail, onChangePassword, onFormSubmit } = useLoginForm(submitLogin);

  return (
    <PageContent>
      <AuthLayout title={AUTH_UI_TEXT.LOGIN_TITLE} subtitle={AUTH_UI_TEXT.LOGIN_SUBTITLE}>
        <LoginForm
          formValues={formValues}
          errors={errors}
          onChangeEmail={onChangeEmail}
          onChangePassword={onChangePassword}
          onSubmit={onFormSubmit}
          isSubmitting={isSubmitting}
        />
        <AuthSwitchText>
          {AUTH_UI_TEXT.LOGIN_SWITCH_TEXT} <AuthSwitchLink to={AUTH_ROUTE_PATHS.REGISTER}>{AUTH_UI_TEXT.LOGIN_SWITCH_LINK}</AuthSwitchLink>
        </AuthSwitchText>
      </AuthLayout>

      <AuthModal
        isOpen={modalState.open}
        title={modalState.title}
        message={modalState.message}
        onClose={closeModal}
        closeLabel={AUTH_UI_TEXT.CANCEL_BUTTON}
        primaryLabel={modalState.primaryLabel}
        onPrimaryAction={modalState.primaryLabel ? onPrimaryModalAction : undefined}
      />
    </PageContent>
  );
};

