"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { MembershipRole } from "@/features/session/types";
import { navForRole } from "./nav-config";

interface SidebarNavProps {
  role?: MembershipRole;
  collapsed?: boolean;
  /** Called after navigating — used to close the mobile drawer. */
  onNavigate?: () => void;
}

export function SidebarNav({ role, collapsed = false, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const items = navForRole(role);

  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        if (item.soon) {
          return (
            <span
              key={item.href}
              title={item.label}
              aria-disabled
              className={cn(
                "flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-rail-muted/60",
                collapsed && "justify-center px-0",
              )}
            >
              <Icon className="size-[18px] shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-rail-muted uppercase">
                    Soon
                  </span>
                </>
              )}
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-rail-active text-rail-active-foreground"
                : "text-rail-muted hover:bg-white/6 hover:text-rail-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            {active && !collapsed && (
              <span className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-r bg-rail-active-foreground" />
            )}
            <Icon className="size-[18px] shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
