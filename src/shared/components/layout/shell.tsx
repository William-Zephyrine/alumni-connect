"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { MainSidebar } from "./main-sidebar";
import { Header } from "./header";

interface ShellProps {
  children: React.ReactNode;
  userName?: string;
}

export function Shell({ children, userName }: ShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <MainSidebar />
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 animate-in slide-in-from-left duration-200">
            <MainSidebar onMobileClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header
          userName={userName}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
