"use client";

import { PanelLeft, PanelLeftClose } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { MembershipRole } from "@/features/session/types";
import { BrandMark } from "./brand-mark";
import { SidebarNav } from "./sidebar-nav";

interface AppSidebarProps {
  role?: MembershipRole;
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}

/** Dark indigo rail (design-system §2, option A) — collapsible + persisted. */
export function AppSidebar({ role, collapsed, onToggle, className }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col bg-rail text-rail-foreground transition-[width] duration-200 ease-out",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <div className={cn("flex h-16 items-center px-4", collapsed && "justify-center px-0")}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <BrandMark />
          {!collapsed && (
            <span className="font-display text-base font-semibold text-white">Vellora</span>
          )}
        </Link>
      </div>

      <SidebarNav role={role} collapsed={collapsed} />

      <div className={cn("border-t border-rail-border p-3", collapsed && "px-2")}>
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-rail-muted transition-colors hover:bg-white/6 hover:text-rail-foreground focus-visible:ring-2 focus-visible:ring-rail-active focus-visible:outline-none",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? (
            <PanelLeft className="size-[18px]" />
          ) : (
            <>
              <PanelLeftClose className="size-[18px]" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
