import type { ExtendedError } from 'socket.io/dist/namespace';
import { CONFIGURATION_CONSTANTS } from '../../utils/constants/configurationConstants';
import type { AuthedSocket } from '../../utils/types/configurationTypes';
import { verifyAuthenticationToken } from '../../utils/auth/tokenHelper';
import { getSocketHandshakeAuthToken, parseTokenFromCookieHeader } from '../utils/socketHelpers';

export const socketAuthMiddleware = (
  socket: AuthedSocket,
  next: (err?: ExtendedError | undefined) => void,
): void => {
  try {
    const cookieToken = parseTokenFromCookieHeader(socket.handshake.headers.cookie);
    const authToken = getSocketHandshakeAuthToken(socket);
    const token = cookieToken || authToken;

    if (!token) {
      next(new Error(CONFIGURATION_CONSTANTS.SOCKET.SOCKET_TRANSPORT_ERROR_MESSAGE));
      return;
    }

    const payload = verifyAuthenticationToken(token);
    socket.data.userId = payload.userId;
    next();
  } catch {
    next(new Error(CONFIGURATION_CONSTANTS.SOCKET.SOCKET_TRANSPORT_ERROR_MESSAGE));
  }
};
