import { authService } from '../services/authService';
import type { ApiResponse } from '../../../types/apiTypes';
import type { AuthUser, LoginPayload } from '../types/authTypes';

export type LoginUserResult = {
  loginResponse: ApiResponse<AuthUser>;
  currentUserResponse: ApiResponse<AuthUser>;
};

export const loginUser = async (payload: LoginPayload): Promise<LoginUserResult> => {
  const loginResponse = await authService.login(payload);
  const currentUserResponse = await authService.getCurrentUser();

  return {
    loginResponse,
    currentUserResponse,
  };
};
