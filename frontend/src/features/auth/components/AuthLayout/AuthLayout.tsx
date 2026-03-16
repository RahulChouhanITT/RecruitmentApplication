import { AppHeader } from "../../../../shared/components/AppHeader/AppHeader";
import type { AuthLayoutProps } from "../../types/authTypes";
import { AuthCard, AuthWrapper, BodyWrapper, PageSubtitle, PageTitle } from "./AuthLayout.styles";

export const AuthLayout = ({ title, subtitle, children }: AuthLayoutProps) => {
  return (
    <AuthWrapper>
      <AppHeader showUserName={false} />

      <BodyWrapper>
        <AuthCard>
          <div>
            <PageTitle>{title}</PageTitle>
            <PageSubtitle>{subtitle}</PageSubtitle>
          </div>
          {children}
        </AuthCard>
      </BodyWrapper>
    </AuthWrapper>
  );
};
