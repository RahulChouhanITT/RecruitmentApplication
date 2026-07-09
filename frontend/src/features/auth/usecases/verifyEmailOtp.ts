import { authService } from '../services/authService';
import type { ApiResponse } from '../../../types/apiTypes';
import type { AuthUser, VerifyEmailPayload } from '../types/authTypes';

export const verifyEmailOtp = async (
  payload: VerifyEmailPayload,
): Promise<ApiResponse<AuthUser>> => {
  return authService.verifyEmail(payload);
};
