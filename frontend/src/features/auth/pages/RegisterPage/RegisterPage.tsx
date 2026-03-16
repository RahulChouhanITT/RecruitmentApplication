import { AuthLayout } from "../../components/AuthLayout/AuthLayout";
import { RegisterForm } from "../../components/RegisterForm/RegisterForm";
import { AUTH_ROUTE_PATHS } from "../../constants/authConstants";
import { AUTH_UI_TEXT } from "../../labels/authLabels";
import { useRegister } from "../../hooks/useRegister";
import { useRegisterForm } from "../../hooks/useRegisterForm";
import { AuthSwitchLink, AuthSwitchText, PageContent } from "./RegisterPage.styles";

export const RegisterPage = () => {
  const { isSubmitting, submitRegister } = useRegister();
  const { formValues, errors, onChangeRole, onChangeName, onChangeEmail, onChangePassword, onFormSubmit } =
    useRegisterForm(submitRegister);

  return (
    <PageContent>
      <AuthLayout title={AUTH_UI_TEXT.REGISTER_TITLE} subtitle={AUTH_UI_TEXT.REGISTER_SUBTITLE}>
        <RegisterForm
          formValues={formValues}
          errors={errors}
          onChangeRole={onChangeRole}
          onChangeName={onChangeName}
          onChangeEmail={onChangeEmail}
          onChangePassword={onChangePassword}
          onSubmit={onFormSubmit}
          isSubmitting={isSubmitting}
        />
        <AuthSwitchText>
          {AUTH_UI_TEXT.REGISTER_SWITCH_TEXT} <AuthSwitchLink to={AUTH_ROUTE_PATHS.LOGIN}>{AUTH_UI_TEXT.REGISTER_SWITCH_LINK}</AuthSwitchLink>
        </AuthSwitchText>
      </AuthLayout>
    </PageContent>
  );
};

