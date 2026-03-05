import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthLoader } from "../features/auth/components/AuthLoader/AuthLoader";
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

export const AppRoutes = () => {
  return (
    <Suspense fallback={<AuthLoader message="Loading page..." />}>
      <Routes>
        <Route
          path="/auth/login"
          element={
            <AuthRedirectRoute>
              <LoginPage />
            </AuthRedirectRoute>
          }
        />
        <Route
          path="/auth/register"
          element={
            <AuthRedirectRoute>
              <RegisterPage />
            </AuthRedirectRoute>
          }
        />
        <Route
          path="/auth/verify-email"
          element={
            <AuthRedirectRoute>
              <VerifyEmailPage />
            </AuthRedirectRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </Suspense>
  );
};
