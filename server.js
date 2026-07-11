const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const activeUsers = new Map();

app.prepare().then(() => {
  const httpServer = createServer();

  const io = new Server(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
    transports: ["polling", "websocket"],
    allowUpgrades: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000,
    maxHttpBufferSize: 1e6,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.engine.on("connection_error", (err) => {
    console.error("[SOCKET] Connection error:", err.message);
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      activeUsers.set(socket.id, userId);
    }

    socket.on("join-server", (serverId) => {
      socket.join(serverId);
    });

    socket.on("leave-server", (serverId) => {
      socket.leave(serverId);
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
    });
  });

  httpServer.on("request", (req, res) => {
    if (req.url && req.url.startsWith("/api/socket")) {
      return;
    }
    handle(req, res);
  });

  httpServer.once("error", (err) => {
    console.error("[SERVER] Fatal error:", err);
    process.exit(1);
  });

  httpServer.listen(port, () => {
    console.log(
      `> Ready on http://${hostname}:${port} (${dev ? "development" : "production"})`
    );
  });

  const shutdown = (signal) => {
    console.log(`\n[SERVER] Received ${signal}, shutting down gracefully...`);
    io.close(() => {
      httpServer.close(() => {
        console.log("[SERVER] Closed");
        process.exit(0);
      });
    });
    setTimeout(() => {
      console.error("[SERVER] Forced shutdown");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
});
