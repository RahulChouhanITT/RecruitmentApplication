import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../../components/AuthLayout';
import { GoogleSignInButton } from '../../components/GoogleSignInButton';
import { LoginForm } from '../../components/LoginForm';
import { AUTH_ROUTE_PATHS } from '../../constants/authConstants';
import { AUTH_UI_TEXT } from '../../labels/authLabels';
import { useLogin } from '../../hooks/useLogin';
import { useLoginForm } from '../../hooks/useLoginForm';
import { AuthDivider, AuthSwitchLink, AuthSwitchText, PageContent } from './LoginPage.styles';
import { AuthModal } from '../../components/AuthModal';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    isSubmitting,
    modalState,
    closeModal,
    handleExternalAuthError,
    onPrimaryModalAction,
    submitLogin,
  } = useLogin();
  const { formValues, errors, handleChange, onFormSubmit } = useLoginForm(submitLogin);

  useEffect(() => {
    const authError = searchParams.get('authError');
    if (!authError) {
      return;
    }

    handleExternalAuthError(authError);
    navigate(AUTH_ROUTE_PATHS.LOGIN, { replace: true });
  }, [handleExternalAuthError, navigate, searchParams]);

  return (
    <PageContent>
      <AuthLayout title={AUTH_UI_TEXT.LOGIN_TITLE} subtitle={AUTH_UI_TEXT.LOGIN_SUBTITLE}>
        <LoginForm
          formValues={formValues}
          errors={errors}
          handleChange={handleChange}
          onSubmit={onFormSubmit}
          isSubmitting={isSubmitting}
        />
        <AuthDivider>{AUTH_UI_TEXT.AUTH_PROVIDER_DIVIDER}</AuthDivider>
        <GoogleSignInButton />
        <AuthSwitchText>
          {AUTH_UI_TEXT.LOGIN_SWITCH_TEXT}{' '}
          <AuthSwitchLink to={AUTH_ROUTE_PATHS.REGISTER}>
            {AUTH_UI_TEXT.LOGIN_SWITCH_LINK}
          </AuthSwitchLink>
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
