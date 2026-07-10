"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { acquireSocket, releaseSocket } from "@/lib/socket/client";
import type { Socket } from "socket.io-client";

interface Message {
  id: string;
  message: string;
  edited?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  userId: string;
  user: {
    fullName: string;
    id: string;
  };
  replyTo?: {
    id: string;
    message: string;
    user: {
      fullName: string;
    };
  } | null;
}

interface DeleteData {
  messageId: string;
  mode: string;
  updatedMessage?: Message;
}

interface UseSocketOptions {
  serverId: string;
  userId: string;
  onNewMessage?: (msg: Message) => void;
  onMessageUpdated?: (msg: Message) => void;
  onMessageDeleted?: (data: DeleteData) => void;
}

export function useSocket({
  serverId,
  userId,
  onNewMessage,
  onMessageUpdated,
  onMessageDeleted,
}: UseSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef({ onNewMessage, onMessageUpdated, onMessageDeleted });
  handlersRef.current = { onNewMessage, onMessageUpdated, onMessageDeleted };

  useEffect(() => {
    const socket = acquireSocket(userId);
    socketRef.current = socket;

    function onConnect() {
      setIsConnected(true);
      socket.emit("join-server", serverId);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onReconnect() {
      setIsConnected(true);
      socket.emit("join-server", serverId);
    }

    function handleNewMessage(msg: Message) {
      handlersRef.current.onNewMessage?.(msg);
    }

    function handleMessageUpdated(msg: Message) {
      handlersRef.current.onMessageUpdated?.(msg);
    }

    function handleMessageDeleted(data: DeleteData) {
      handlersRef.current.onMessageDeleted?.(data);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("reconnect", onReconnect);
    socket.on("new-message", handleNewMessage);
    socket.on("message-updated", handleMessageUpdated);
    socket.on("message-deleted", handleMessageDeleted);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.emit("leave-server", serverId);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("reconnect", onReconnect);
      socket.off("new-message", handleNewMessage);
      socket.off("message-updated", handleMessageUpdated);
      socket.off("message-deleted", handleMessageDeleted);
      releaseSocket();
    };
  }, [serverId, userId]);

  const emit = useCallback(
    (event: string, data: unknown) => {
      socketRef.current?.emit(event, data);
    },
    []
  );

  return { socket: socketRef.current, isConnected, emit };
}
