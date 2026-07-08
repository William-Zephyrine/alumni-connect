"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { 
  LayoutDashboard, 
  Server, 
  MessageSquare, 
  Users, 
  Image as ImageIcon, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  CalendarDays,
  X,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface MainSidebarProps {
  onMobileClose?: () => void;
}

export function MainSidebar({ onMobileClose }: MainSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const serverId = params?.serverId as string;

  const navItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
  ];

  const serverItems = serverId ? [
    { name: "Chat Group", icon: MessageSquare, href: `/server/${serverId}`, active: pathname === `/server/${serverId}` },
    { name: "Pengumuman", icon: Megaphone, href: `/server/${serverId}/announcements`, active: pathname?.includes("/announcements") ?? false },
    { name: "Event", icon: CalendarDays, href: `/server/${serverId}/events`, active: pathname?.includes("/events") ?? false },
    { name: "Direktori Alumni", icon: Users, href: `/server/${serverId}/archive/alumni`, active: pathname?.includes("/archive/alumni") ?? false },
    { name: "Kenangan", icon: ImageIcon, href: `/server/${serverId}/archive/memories`, active: pathname?.includes("/memories") ?? false },
    { name: "Anggota", icon: Users, href: `/server/${serverId}/members`, active: pathname?.includes("/members") ?? false },
  ] : [];

  const serverSettingsItems = serverId ? [
    { name: "Pengaturan Server", icon: Settings, href: `/server/${serverId}/settings`, active: pathname?.includes("/settings") ?? false },
    { name: "Keluar Server", icon: LogOut, href: `/server/${serverId}/leave`, active: pathname?.includes("/leave") ?? false },
  ] : [];

  return (
    <aside 
      className={cn(
        "flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-200 h-screen sticky top-0 z-40",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Brand */}
      <div className="h-14 md:h-16 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
              <Server size={16} className="text-white" />
            </div>
            <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">
              Alumni<span className="text-blue-600 dark:text-blue-400">Connect</span>
            </span>
          </div>
        )}
        <button
          onClick={onMobileClose}
          className="md:hidden p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 rounded-lg transition-colors duration-150"
        >
          <X size={18} />
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:block p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 rounded-lg transition-colors duration-150"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              Utama
            </p>
          )}
          {navItems.map((item) => (
            <Link 
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm",
                item.active 
                  ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-medium" 
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </div>

        {serverId && (
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                Server
              </p>
            )}
            {serverItems.map((item) => (
              <Link 
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm",
                  item.active 
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-medium" 
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
              {serverSettingsItems.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm",
                    item.active 
                      ? "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 font-medium" 
                      : "text-zinc-500 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-800 dark:hover:text-zinc-300"
                  )}
                >
                  <item.icon size={18} className="shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
        <Link 
          href="/profile"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 text-sm",
            pathname === "/profile" 
              ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-medium"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200"
          )}
        >
          <Settings size={18} className="shrink-0" />
          {!collapsed && <span>Pengaturan</span>}
        </Link>
      </div>
    </aside>
  );
}
