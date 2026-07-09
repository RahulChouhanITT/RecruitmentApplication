import { AUTH_API_ROUTES } from '../constants/authConstants';
import type { AuthRole } from '../types/authTypes';
import { buildApiUrl } from '../../../config/api';

export const buildGoogleAuthUrl = (role?: AuthRole): string => {
  const url = new URL(buildApiUrl(AUTH_API_ROUTES.GOOGLE));

  if (role) {
    url.searchParams.set('role', role);
  }

  return url.toString();
};
