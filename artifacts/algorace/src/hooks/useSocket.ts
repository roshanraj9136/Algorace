import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { TOKEN_KEY } from "./useAuth";

const API_URL = import.meta.env.VITE_API_URL || "";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    const socket = io(API_URL, {
      path: "/ws",
      auth: { token },
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  return socketRef.current;
}
