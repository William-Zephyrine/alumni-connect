import { Server as NetServer } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import { Server as ServerIO } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Track unique users. 
// Using a Map: socketId -> userId to handle disconnects properly.
const activeUsers = new Map<string, string>();

const ioHandler = (req: NextApiRequest, res: any) => {
  if (req.method === 'GET') {
    // Return count of unique users
    const uniqueUsers = new Set(activeUsers.values());
    return res.status(200).json({ count: uniqueUsers.size });
  }

  if (!res.socket.server.io) {
    console.log("*First use, starting socket.io");
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*",
      }
    });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      const userId = socket.handshake.query.userId as string;
      if (userId) {
        activeUsers.set(socket.id, userId);
        console.log(`User ${userId} connected with socket ${socket.id}`);
      }

      socket.on("join-server", (serverId) => {
        socket.join(serverId);
        console.log(`Socket ${socket.id} joined server ${serverId}`);
      });

      socket.on("send-message", (data) => {
        socket.to(data.serverId).emit("new-message", data.message);
      });

      socket.on("edit-message", (data) => {
        socket.to(data.serverId).emit("message-updated", data.message);
      });

      socket.on("delete-message", (data) => {
        socket.to(data.serverId).emit("message-deleted", data);
      });

      socket.on("disconnect", () => {
        activeUsers.delete(socket.id);
        console.log("Client disconnected", socket.id);
      });
    });
  }
  res.end();
};

export default ioHandler;
