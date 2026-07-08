"use client";

import { useEffect } from "react";
import { Menu } from "lucide-react";
import { io } from "socket.io-client";

interface HeaderProps {
  userName?: string;
  onMenuClick?: () => void;
}

export function Header({ userName, onMenuClick }: HeaderProps) {
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_APP_URL || "", {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    fetch("/api/servers/me")
      .then((res) => res.json())
      .then((servers: { id: string }[]) => {
        if (Array.isArray(servers)) {
          servers.forEach((server) => socket.emit("join-server", server.id));
        }
      });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <header className="h-14 md:h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between shrink-0">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 -ml-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors duration-150"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="md:hidden font-semibold text-sm text-zinc-800 dark:text-zinc-200">
        Alumni<span className="text-blue-600 dark:text-blue-400">Connect</span>
      </div>

      <div className="flex-1" />
    </header>
  );
}
