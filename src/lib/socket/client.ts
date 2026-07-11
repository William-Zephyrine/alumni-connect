import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let instances = 0;

function getSocketUrl(): string | undefined {
  if (typeof window !== "undefined" && window.location) {
    return window.location.origin;
  }
  return undefined;
}

export function acquireSocket(userId: string): Socket {
  instances++;
  if (!socket) {
    const url = getSocketUrl();
    socket = io(url, {
      path: "/api/socket",
      addTrailingSlash: false,
      query: { userId },
      transports: ["polling", "websocket"],
      rememberUpgrade: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socket.on("connect", () => {
      console.log("[SOCKET] Connected:", socket!.id);
    });

    socket.on("connect_error", (err) => {
      console.error("[SOCKET] Error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("[SOCKET] Disconnected:", reason);
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
