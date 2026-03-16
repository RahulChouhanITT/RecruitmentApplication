import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { APP_ROUTE_PATHS } from "../utils/constants/routeConstants";
import { AuthLoader } from "../features/auth/components/AuthLoader/AuthLoader";
import { AUTH_UI_TEXT } from "../features/auth/labels/authLabels";
import { AuthRedirectRoute } from "./AuthRedirectRoute";
import { ProtectedRoute } from "./ProtectedRoute";

const LoginPage = lazy(async () => {
  const module = await import("../features/auth/pages/LoginPage/LoginPage");
  return { default: module.LoginPage };
});

const RegisterPage = lazy(async () => {
  const module = await import("../features/auth/pages/RegisterPage/RegisterPage");
  return { default: module.RegisterPage };
});

const VerifyEmailPage = lazy(async () => {
  const module = await import("../features/auth/pages/VerifyEmailPage/VerifyEmailPage");
  return { default: module.VerifyEmailPage };
});

const DashboardPage = lazy(async () => {
  const module = await import("../features/dashboard/pages/DashboardPage/DashboardPage");
  return { default: module.DashboardPage };
});

const NotFoundPage = lazy(async () => {
  const module = await import("../features/dashboard/pages/NotFoundPage/NotFoundPage");
  return { default: module.NotFoundPage };
});

export const AppRoutes = () => {
  return (
    <Suspense fallback={<AuthLoader message={AUTH_UI_TEXT.LOADING_PAGE ?? "Loading page..."} />}>
      <Routes>
        <Route
          path={APP_ROUTE_PATHS.AUTH_LOGIN}
          element={
            <AuthRedirectRoute>
              <LoginPage />
            </AuthRedirectRoute>
          }
        />
        <Route
          path={APP_ROUTE_PATHS.AUTH_REGISTER}
          element={
            <AuthRedirectRoute>
              <RegisterPage />
            </AuthRedirectRoute>
          }
        />
        <Route
          path={APP_ROUTE_PATHS.AUTH_VERIFY_EMAIL}
          element={
            <AuthRedirectRoute>
              <VerifyEmailPage />
            </AuthRedirectRoute>
          }
        />
        <Route
          path={APP_ROUTE_PATHS.DASHBOARD_WILDCARD}
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path={APP_ROUTE_PATHS.NOT_FOUND} element={<NotFoundPage />} />
        <Route path={APP_ROUTE_PATHS.FALLBACK} element={<Navigate to={APP_ROUTE_PATHS.NOT_FOUND} replace />} />
      </Routes>
    </Suspense>
  );
};
