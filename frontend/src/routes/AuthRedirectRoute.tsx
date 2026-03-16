import { type PropsWithChildren, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { APP_ROUTE_PATHS } from "../utils/constants/routeConstants";
import { useGetCurrentUserQuery } from "../features/auth/api/authApi";
import { AUTH_LOADER_MESSAGES } from "../features/auth/labels/authLabels";
import { setCurrentUser } from "../features/auth/state/authSlice";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { AuthLoader } from "../features/auth/components/AuthLoader/AuthLoader";

export const AuthRedirectRoute = ({ children }: PropsWithChildren) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const { data, isLoading } = useGetCurrentUserQuery();

  useEffect(() => {
    if (data?.data) {
      dispatch(setCurrentUser(data.data));
    }
  }, [data, dispatch]);

  const user = currentUser ?? data?.data;
  if (isLoading) {
    return <AuthLoader message={AUTH_LOADER_MESSAGES.LOADING_AUTHENTICATION} />;
  }
  
  if (user?.isEmailVerified && user?.isApproved) {
    return <Navigate to={APP_ROUTE_PATHS.DASHBOARD} replace />;
  }
 
  return <>{children}</>;
};
