import type { Socket } from "socket.io";

export type AuthedSocket = Socket & {
  data: Socket["data"] & {
    userId?: string;
  };
};
