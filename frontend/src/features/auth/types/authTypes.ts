import type { FormEvent, PropsWithChildren } from 'react';
import type { AxiosBaseQueryArgs } from '../../../types/apiTypes';

export type AuthRole = 'hr' | 'candidate' | 'interviewer';
export type AuthProvider = 'local' | 'google' | 'hybrid';

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  role: AuthRole;
  fullName: string;
  email: string;
  password: string;
};

export type VerifyEmailPayload = {
  email: string;
  otp: string;
};

export type ResendOtpPayload = {
  email: string;
};

export type AuthLoaderProps = {
  message?: string;
};

export type AuthLayoutProps = PropsWithChildren<{
  title: string;
  subtitle: string;
  centerOnMobile?: boolean;
}>;

export type AuthModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  closeLabel?: string;
  primaryLabel?: string;
  onPrimaryAction?: () => void;
};

export type LoginFormProps = {
  formValues: LoginPayload;
  errors: AuthFormErrors<LoginPayload>;
  handleChange: AuthFormChangeHandler<LoginPayload>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  isSubmitting?: boolean;
};

export type RegisterFormProps = {
  formValues: RegisterPayload;
  errors: AuthFormErrors<RegisterPayload>;
  handleChange: AuthFormChangeHandler<RegisterPayload>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  isSubmitting?: boolean;
};

export type AuthFormErrors<TFormValues> = Partial<Record<keyof TFormValues, string>>;

export type AuthFormChangeHandler<TFormValues> = <TField extends keyof TFormValues>(
  field: TField,
  value: TFormValues[TField],
) => void;

export type VerifyLocationState = {
  email?: string;
  autoSendOtp?: boolean;
};

export type LoginPageModalState = {
  open: boolean;
  title: string;
  message: string;
  primaryLabel?: string;
  primaryAction?: 'verify_email';
  email?: string;
};

export type AuthAxiosBaseQueryArgs = AxiosBaseQueryArgs;

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: AuthRole;
  authProvider: AuthProvider;
  profileCompleted: boolean;
  isEmailVerified: boolean;
  isApproved: boolean;
};
