import { CONFIGURATION_CONSTANTS } from "../constants/configurationConstants";
import type { AuthedSocket } from "../types/configurationTypes";

export const getSocketHandshakeAuthToken = (socket: AuthedSocket): string | null =>
  typeof socket.handshake.auth?.token === "string"
    ? socket.handshake.auth.token
    : CONFIGURATION_CONSTANTS.DEFAULTS.NULL;
