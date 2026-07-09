import type { Server as HttpServer } from 'http';
import { initializeSocketServer } from '../socket';

export const setupSocket = (httpServer: HttpServer) => {
  return initializeSocketServer(httpServer);
};
