import { useNavigate } from 'react-router-dom';
import { FiAlertCircle } from 'react-icons/fi';
import { useAppSelector } from '../../../../app/hooks';
import { APP_ROUTE_PATHS } from '../../../../utils/constants/routeConstants';
import { EmptyStateCard } from '../../components/EmptyStateCard';
import { ButtonRow, PageWrap, SecondaryButton } from './NotFoundPage.styles';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const onGoBack = (): void => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(currentUser ? APP_ROUTE_PATHS.DASHBOARD : APP_ROUTE_PATHS.AUTH_LOGIN, {
      replace: true,
    });
  };

  return (
    <PageWrap>
      <EmptyStateCard
        icon={FiAlertCircle}
        title="Page Not Found"
        description="The page you are trying to open does not exist."
      />
      <ButtonRow>
        <SecondaryButton type="button" onClick={onGoBack}>
          Go Back
        </SecondaryButton>
      </ButtonRow>
    </PageWrap>
  );
};
