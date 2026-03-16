import { store } from "../../../app/store";
import { authApi } from "../api/authApi";
import type {
  AuthApiResponse,
  AuthUser,
  LoginPayload,
  PendingApprovalUser,
  RegisterPayload,
  ResendOtpPayload,
  UserProfile,
  VerifyEmailPayload,
} from "../types/authTypes";

export const authService = {
  login: (payload: LoginPayload): Promise<AuthApiResponse<AuthUser>> =>
    store.dispatch(authApi.endpoints.login.initiate(payload)).unwrap(),
  registerCandidate: (payload: RegisterPayload): Promise<AuthApiResponse<AuthUser>> =>
    store.dispatch(authApi.endpoints.registerCandidate.initiate(payload)).unwrap(),
  verifyEmail: (payload: VerifyEmailPayload): Promise<AuthApiResponse<AuthUser>> =>
    store.dispatch(authApi.endpoints.verifyEmail.initiate(payload)).unwrap(),
  resendOtp: (payload: ResendOtpPayload): Promise<AuthApiResponse> =>
    store.dispatch(authApi.endpoints.resendOtp.initiate(payload)).unwrap(),
  getCurrentUser: (): Promise<AuthApiResponse<AuthUser>> =>
    store.dispatch(authApi.endpoints.getCurrentUser.initiate()).unwrap(),
  getPendingApprovals: (): Promise<AuthApiResponse<PendingApprovalUser[]>> =>
    store.dispatch(authApi.endpoints.getPendingApprovals.initiate()).unwrap(),
  getProfile: (): Promise<AuthApiResponse<UserProfile>> =>
    store.dispatch(authApi.endpoints.getProfile.initiate()).unwrap(),
};
