"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Newspaper, Image, Bot, Globe, BarChart3,
  Settings, FolderKanban, ChevronLeft, ChevronRight, Shield,
  Zap, LogOut
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, href: "/admin?view=dashboard" },
  { id: "news", label: "Haberler", icon: <Newspaper className="h-4 w-4" />, href: "/admin?view=news" },
  { id: "trtex", label: "TRTEX", icon: <Globe className="h-4 w-4" />, href: "/admin?view=trtex", badge: "GM" },
  { id: "media", label: "Medya", icon: <Image className="h-4 w-4" />, href: "/admin?view=media" },
  { id: "aloha", label: "ALOHA", icon: <Bot className="h-4 w-4" />, href: "/admin?view=aloha", badge: "AI" },
  { id: "domains", label: "Domainler", icon: <Globe className="h-4 w-4" />, href: "/admin?view=domains" },
  { id: "analytics", label: "Analitik", icon: <BarChart3 className="h-4 w-4" />, href: "/admin?view=analytics" },
  { id: "projects", label: "Projeler", icon: <FolderKanban className="h-4 w-4" />, href: "/admin?view=projects" },
  { id: "security", label: "Güvenlik", icon: <Shield className="h-4 w-4" />, href: "/admin?view=security" },
  { id: "settings", label: "Ayarlar", icon: <Settings className="h-4 w-4" />, href: "/admin?view=settings" },
];

interface AdminSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onSwitchToAloha: () => void;
}

export default function AdminSidebar({ activeView, onViewChange, onSwitchToAloha }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-56'}
        bg-[#0a0a0f] border-r border-white/[0.06]`}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Zap className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-white tracking-wider">AIPYRAM</span>
              <span className="text-[9px] text-white/40 font-medium">CONTROL CENTER</span>
            </div>
          )}
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[12px] font-medium transition-all duration-150
                ${isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04] border border-transparent'
                }`}
              title={collapsed ? item.label : undefined}
            >
              <span className={`flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-white/40'}`}>
                {item.icon}
              </span>
              {!collapsed && (
                <>
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400 font-bold">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* ALOHA Quick Access */}
      <div className="px-2 py-2 border-t border-white/[0.06]">
        <button
          onClick={onSwitchToAloha}
          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-[11px] font-bold
            bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-300
            hover:from-blue-600/30 hover:to-indigo-600/30 transition-all border border-blue-500/10`}
          title="ALOHA Terminal"
        >
          <Bot className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>ALOHA Terminal</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <div className="px-2 py-2 border-t border-white/[0.06]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-1.5 rounded text-white/30 hover:text-white/60 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
