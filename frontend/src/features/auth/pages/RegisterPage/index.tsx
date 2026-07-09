import { AuthLayout } from '../../components/AuthLayout';
import { GoogleSignInButton } from '../../components/GoogleSignInButton';
import { RegisterForm } from '../../components/RegisterForm';
import { AUTH_ROUTE_PATHS } from '../../constants/authConstants';
import { AUTH_UI_TEXT } from '../../labels/authLabels';
import { useRegister } from '../../hooks/useRegister';
import { useRegisterForm } from '../../hooks/useRegisterForm';
import { AuthDivider, AuthSwitchLink, AuthSwitchText, PageContent } from './RegisterPage.styles';

export const RegisterPage = () => {
  const { isSubmitting, submitRegister } = useRegister();
  const { formValues, errors, handleChange, onFormSubmit } = useRegisterForm(submitRegister);

  return (
    <PageContent>
      <AuthLayout
        title={AUTH_UI_TEXT.REGISTER_TITLE}
        subtitle={AUTH_UI_TEXT.REGISTER_SUBTITLE}
        centerOnMobile
      >
        <RegisterForm
          formValues={formValues}
          errors={errors}
          handleChange={handleChange}
          onSubmit={onFormSubmit}
          isSubmitting={isSubmitting}
        />
        <AuthDivider>{AUTH_UI_TEXT.AUTH_PROVIDER_DIVIDER}</AuthDivider>
        <GoogleSignInButton role={formValues.role} />
        <AuthSwitchText>
          {AUTH_UI_TEXT.REGISTER_SWITCH_TEXT}{' '}
          <AuthSwitchLink to={AUTH_ROUTE_PATHS.LOGIN}>
            {AUTH_UI_TEXT.REGISTER_SWITCH_LINK}
          </AuthSwitchLink>
        </AuthSwitchText>
      </AuthLayout>
    </PageContent>
  );
};
