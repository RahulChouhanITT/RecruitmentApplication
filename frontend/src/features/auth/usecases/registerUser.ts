import { authService } from '../services/authService';
import type { ApiResponse } from '../../../types/apiTypes';
import type { AuthUser, RegisterPayload } from '../types/authTypes';

export const registerUser = async (
  payload: RegisterPayload,
): Promise<ApiResponse<AuthUser>> => {
  return authService.registerUser(payload);
};
