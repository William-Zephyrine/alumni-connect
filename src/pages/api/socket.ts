import type { Server as HTTPServer } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Socket as NetSocket } from "net";
import { Server as ServerIO } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
  },
};

const activeUsers = new Map<string, string>();

interface CustomSocketResponse extends NextApiResponse {
  socket: NetSocket & {
    server: HTTPServer & {
      io?: ServerIO;
    };
  };
}

const ioHandler = (req: NextApiRequest, res: CustomSocketResponse) => {
  if (!res.socket.server.io) {
    const io = new ServerIO(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      transports: ["polling", "websocket"],
      allowUpgrades: true,
      pingTimeout: 60000,
      pingInterval: 25000,
      cors: {
        origin: "*",
      },
    });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      const userId = socket.handshake.query.userId as string;
      if (userId) {
        activeUsers.set(socket.id, userId);
      }

      socket.on("join-server", (serverId: string) => {
        void socket.join(serverId);
      });

      socket.on("leave-server", (serverId: string) => {
        void socket.leave(serverId);
      });

      socket.on("send-message", (data: { serverId: string; message: unknown }) => {
        socket.to(data.serverId).emit("new-message", data.message);
      });

      socket.on("edit-message", (data: { serverId: string; message: unknown }) => {
        socket.to(data.serverId).emit("message-updated", data.message);
      });

      socket.on(
        "delete-message",
        (data: { serverId: string; messageId: string; mode: string; updatedMessage?: unknown }) => {
          socket.to(data.serverId).emit("message-deleted", data);
        }
      );

      socket.on("disconnect", () => {
        activeUsers.delete(socket.id);
      });
    });
  }
  res.end();
};

export default ioHandler;
