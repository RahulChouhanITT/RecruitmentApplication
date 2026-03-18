/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { io, type Socket } from "socket.io-client";
import { useAppSelector } from "../hooks";
import { API_BASE_URL } from "../../features/dashboard/utils/chatThreadHelpers";
import { SocketContext } from "./socketContext";

export const SocketProvider = ({ children }: PropsWithChildren) => {
  const currentUserId = useAppSelector((state) => state.auth.currentUser?._id ?? "");
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!currentUserId) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      return;
    }

    if (!socketRef.current) {
      socketRef.current = io(API_BASE_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
      });
      setSocket(socketRef.current);
      return;
    }

    setSocket(socketRef.current);
  }, [currentUserId]);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const value = useMemo(() => ({ socket }), [socket]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
