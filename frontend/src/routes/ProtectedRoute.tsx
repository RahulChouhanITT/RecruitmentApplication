import { type PropsWithChildren, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { APP_ROUTE_PATHS } from '../utils/constants/routeConstants';
import { useGetCurrentUserQuery } from '../features/auth/api/authApi';
import { AUTH_LOADER_MESSAGES } from '../features/auth/labels/authLabels';
import { setCurrentUser } from '../features/auth/state/authSlice';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { AuthLoader } from '../features/auth/components/AuthLoader';

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const { data, isLoading, isError } = useGetCurrentUserQuery(undefined, {
    skip: Boolean(currentUser),
  });

  useEffect(() => {
    if (data?.data) {
      dispatch(setCurrentUser(data.data));
    }
  }, [data, dispatch]);

  const user = currentUser ?? data?.data;

  if (isLoading) {
    return <AuthLoader message={AUTH_LOADER_MESSAGES.CHECKING_SESSION} />;
  }

  if (isError || !user) {
    return <Navigate to={APP_ROUTE_PATHS.AUTH_LOGIN} replace />;
  }

  if (!user.isApproved || !user.isEmailVerified) {
    return <Navigate to={APP_ROUTE_PATHS.AUTH_LOGIN} replace />;
  }

  return <>{children}</>;
};
