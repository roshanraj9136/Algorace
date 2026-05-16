import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { TOKEN_KEY } from "./useAuth";

const API_URL = import.meta.env.VITE_API_URL || "";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    const nextSocket = io(API_URL, {
      path: "/ws",
      auth: { token },
    });

    setSocket(nextSocket);

    return () => {
      nextSocket.disconnect();
      setSocket(null);
    };
  }, []);

  return socket;
}
