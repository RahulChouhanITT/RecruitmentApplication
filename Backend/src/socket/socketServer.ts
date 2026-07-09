import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { CONFIGURATION_CONSTANTS } from '../utils/constants/configurationConstants';
import { env } from '../configuration/env';
import { socketAuthMiddleware } from './middleware/socketAuthMiddleware';
import { registerChatRealtimeBridge } from './handlers/chatRealtimeBridge';
import { createConnectionHandler } from './handlers/connectionHandler';

let ioInstance: Server | null = null;

export const getSocketServer = (): Server | null => ioInstance;

export const initializeSocketServer = (httpServer: HttpServer): Server => {
  if (ioInstance) {
    return ioInstance;
  }

  ioInstance = new Server(httpServer, {
    path: CONFIGURATION_CONSTANTS.SOCKET.PATH,
    cors: {
      origin: env.FRONTEND_ORIGIN,
      credentials: true,
    },
  });

  ioInstance.use(socketAuthMiddleware);
  registerChatRealtimeBridge(ioInstance);
  ioInstance.on(
    CONFIGURATION_CONSTANTS.SOCKET.EVENTS.CONNECTION,
    createConnectionHandler(ioInstance),
  );

  return ioInstance;
};
