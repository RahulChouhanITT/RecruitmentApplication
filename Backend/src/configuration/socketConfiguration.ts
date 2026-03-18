import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { APPLICATION_CONSTANTS } from "../utils/constants/applicationConstants";
import { CONFIGURATION_CONSTANTS } from "../utils/constants/configurationConstants";
import { getSocketHandshakeAuthToken } from "../utils";
import type { AuthedSocket } from "../utils/types/configurationTypes";
import { verifyAuthenticationToken } from "../utils/auth/tokenHelper";

let ioInstance: Server | null = CONFIGURATION_CONSTANTS.DEFAULTS.NULL;
const onlineUsers = new Set<string>();
const userSockets = new Map<string, Set<string>>();

const parseTokenFromCookieHeader = (cookieHeader: string | undefined): string | null => {
  if (!cookieHeader) {
    return CONFIGURATION_CONSTANTS.DEFAULTS.NULL;
  }

  const cookies = cookieHeader.split(";").map((part) => part.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith(`${APPLICATION_CONSTANTS.TOKEN_COOKIE_NAME}=`)) {
      return decodeURIComponent(cookie.split("=")[1] ?? CONFIGURATION_CONSTANTS.DEFAULTS.EMPTY_STRING);
    }
  }

  return CONFIGURATION_CONSTANTS.DEFAULTS.NULL;
};

export const getSocketServer = (): Server | null => ioInstance;
export const isUserOnline = (userId: string): boolean => onlineUsers.has(userId);

export const buildUserRoom = (userId: string): string =>
  `${CONFIGURATION_CONSTANTS.SOCKET.USER_ROOM_PREFIX}${userId}`;

export const initializeSocketServer = (httpServer: HttpServer): Server => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: CONFIGURATION_CONSTANTS.SOCKET.FRONTEND_ORIGIN,
      credentials: true,
    },
  });

  ioInstance.use((socket: AuthedSocket, next) => {
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
    } catch (_error) {
      next(new Error(CONFIGURATION_CONSTANTS.SOCKET.SOCKET_TRANSPORT_ERROR_MESSAGE));
    }
  });

  ioInstance.on(CONFIGURATION_CONSTANTS.SOCKET.EVENTS.CONNECTION, (socket: AuthedSocket) => {
    const userId = socket.data.userId;
    if (userId) {
      socket.join(buildUserRoom(userId));
      const socketsForUser = userSockets.get(userId) ?? new Set<string>();
      const wasOffline = socketsForUser.size === 0;
      socketsForUser.add(socket.id);
      userSockets.set(userId, socketsForUser);
      onlineUsers.add(userId);
      if (wasOffline) {
        ioInstance?.emit(CONFIGURATION_CONSTANTS.SOCKET.EVENTS.PRESENCE_CHANGED, { userId, isOnline: true });
      }
    }

    socket.on(CONFIGURATION_CONSTANTS.SOCKET.EVENTS.DISCONNECT, () => {
      const disconnectedUserId = socket.data.userId;
      if (disconnectedUserId) {
        const socketsForUser = userSockets.get(disconnectedUserId);
        if (socketsForUser) {
          socketsForUser.delete(socket.id);
          if (socketsForUser.size === 0) {
            userSockets.delete(disconnectedUserId);
            onlineUsers.delete(disconnectedUserId);
            ioInstance?.emit(CONFIGURATION_CONSTANTS.SOCKET.EVENTS.PRESENCE_CHANGED, {
              userId: disconnectedUserId,
              isOnline: false,
            });
          } else {
            userSockets.set(disconnectedUserId, socketsForUser);
          }
        }
      }
    });
  });

  return ioInstance;
};
