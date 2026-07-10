import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let instances = 0;

export function acquireSocket(userId: string): Socket {
  instances++;
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_APP_URL || "", {
      path: "/api/socket",
      addTrailingSlash: false,
      query: { userId },
      transports: ["polling", "websocket"],
      rememberUpgrade: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return socket;
}

export function releaseSocket(): void {
  instances = Math.max(0, instances - 1);
  if (instances <= 0 && socket) {
    socket.disconnect();
    socket = null;
    instances = 0;
  }
}

export function getSocket(): Socket | null {
  return socket;
}
