"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/stores";
import {
  LayoutDashboard,
  Calendar,
  ListChecks,
  BarChart3,
  User,
  Trophy,
  ImageIcon,
  Settings,
  ClipboardList,
  Clock,
  History,
  ChevronLeft,
  ChevronRight,
  Flame,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/today", label: "Today", icon: Clock },
  { href: "/routines", label: "Routines", icon: ListChecks },
  { href: "/routines/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/history", label: "History", icon: History },
  { href: "/review", label: "Review", icon: ClipboardList },
  { type: "divider" as const },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/profile/trophies", label: "Trophies", icon: Trophy },
  { href: "/profile/gallery", label: "Gallery", icon: ImageIcon },
  { type: "divider" as const },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
        sidebarOpen ? "w-60" : "w-16"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Flame className="h-6 w-6 shrink-0 text-primary" />
        {sidebarOpen && (
          <span className="text-base font-bold tracking-tight">Productive Guy</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item, i) => {
          if ("type" in item && item.type === "divider") {
            return <div key={`div-${i}`} className="my-2 border-t border-border" />;
          }
          const navItem = item as { href: string; label: string; icon: any };
          const Icon = navItem.icon;
          const isActive =
            pathname === navItem.href || pathname.startsWith(navItem.href + "/");

          return (
            <Link
              key={navItem.href}
              href={navItem.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {sidebarOpen && <span>{navItem.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse button */}
      <div className="border-t border-border p-2">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
