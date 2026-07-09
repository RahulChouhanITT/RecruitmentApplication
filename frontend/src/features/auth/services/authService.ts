import { store } from '../../../app/store';
import { authApi } from '../api/authApi';
import type { ApiResponse } from '../../../types/apiTypes';
import type { AuthUser, LoginPayload, RegisterPayload, ResendOtpPayload, VerifyEmailPayload } from '../types/authTypes';

export const authService = {
  login: (payload: LoginPayload): Promise<ApiResponse<AuthUser>> =>
    store.dispatch(authApi.endpoints.login.initiate(payload)).unwrap(),
  registerUser: (payload: RegisterPayload): Promise<ApiResponse<AuthUser>> =>
    store.dispatch(authApi.endpoints.registerUser.initiate(payload)).unwrap(),
  verifyEmail: (payload: VerifyEmailPayload): Promise<ApiResponse<AuthUser>> =>
    store.dispatch(authApi.endpoints.verifyEmail.initiate(payload)).unwrap(),
  resendOtp: (payload: ResendOtpPayload): Promise<ApiResponse> =>
    store.dispatch(authApi.endpoints.resendOtp.initiate(payload)).unwrap(),
  getCurrentUser: (): Promise<ApiResponse<AuthUser>> =>
    store.dispatch(authApi.endpoints.getCurrentUser.initiate()).unwrap(),
};
