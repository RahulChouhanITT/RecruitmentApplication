import { APPLICATION_CONSTANTS } from '../../utils/constants/applicationConstants';
import { CONFIGURATION_CONSTANTS } from '../../utils/constants/configurationConstants';
import type { AuthedSocket } from '../../utils/types/configurationTypes';

export const parseTokenFromCookieHeader = (cookieHeader: string | undefined): string | null => {
  if (!cookieHeader) {
    return CONFIGURATION_CONSTANTS.DEFAULTS.NULL;
  }

  const cookies = cookieHeader.split(';').map((part) => part.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith(`${APPLICATION_CONSTANTS.TOKEN_COOKIE_NAME}=`)) {
      return decodeURIComponent(
        cookie.split('=')[1] ?? CONFIGURATION_CONSTANTS.DEFAULTS.EMPTY_STRING,
      );
    }
  }

  return CONFIGURATION_CONSTANTS.DEFAULTS.NULL;
};

export const getSocketHandshakeAuthToken = (socket: AuthedSocket): string | null =>
  typeof socket.handshake.auth?.token === 'string'
    ? socket.handshake.auth.token
    : CONFIGURATION_CONSTANTS.DEFAULTS.NULL;

export const buildUserRoom = (userId: string): string =>
  `${CONFIGURATION_CONSTANTS.SOCKET.USER_ROOM_PREFIX}${userId}`;
