import type { Server } from 'socket.io';
import { CONFIGURATION_CONSTANTS } from '../../utils/constants/configurationConstants';
import type { AuthedSocket } from '../../utils/types/configurationTypes';
import { unregisterUserPresence } from '../services/presenceStore';

export const createDisconnectHandler = (io: Server, socket: AuthedSocket) => (): void => {
  const disconnectedUserId = socket.data.userId;
  if (!disconnectedUserId) {
    return;
  }

  const isNowOffline = unregisterUserPresence(disconnectedUserId, socket.id);
  if (isNowOffline) {
    io.emit(CONFIGURATION_CONSTANTS.SOCKET.EVENTS.PRESENCE_CHANGED, {
      userId: disconnectedUserId,
      isOnline: false,
    });
  }
};
