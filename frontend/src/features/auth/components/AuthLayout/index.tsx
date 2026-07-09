import { AppHeader } from '../../../../shared/components/AppHeader';
import type { AuthLayoutProps } from '../../types/authTypes';
import { AuthCard, AuthWrapper, BodyWrapper, PageSubtitle, PageTitle } from './AuthLayout.styles';

export const AuthLayout = ({
  title,
  subtitle,
  children,
  centerOnMobile = false,
}: AuthLayoutProps) => {
  return (
    <AuthWrapper>
      <AppHeader showUserName={false} />

      <BodyWrapper $centerOnMobile={Boolean(centerOnMobile)}>
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
