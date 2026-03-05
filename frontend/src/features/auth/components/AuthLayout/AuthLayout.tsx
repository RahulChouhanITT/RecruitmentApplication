import type { PropsWithChildren } from "react";
import { AppHeader } from "../../../../shared/components/AppHeader/AppHeader";
import { AuthCard, AuthWrapper, BodyWrapper, PageSubtitle, PageTitle } from "./AuthLayout.styles";

type AuthLayoutProps = PropsWithChildren<{
  title: string;
  subtitle: string;
}>;

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
