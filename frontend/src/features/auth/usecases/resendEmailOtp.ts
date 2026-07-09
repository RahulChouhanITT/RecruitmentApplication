import { authService } from '../services/authService';
import type { ApiResponse } from '../../../types/apiTypes';
import type { ResendOtpPayload } from '../types/authTypes';

export const resendEmailOtp = async (payload: ResendOtpPayload): Promise<ApiResponse> => {
  return authService.resendOtp(payload);
};
