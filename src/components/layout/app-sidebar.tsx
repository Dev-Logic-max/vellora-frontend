"use client";

import { LogOut, Settings } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth";
import { setActiveCompanyId } from "@/lib/active-company";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { CurrentUser, MembershipRole } from "@/features/session/types";
import { BrandMark } from "./brand-mark";
import { SidebarNav } from "./sidebar-nav";

interface AppSidebarProps {
  user: CurrentUser;
  collapsed: boolean;
  className?: string;
}

const roleLabel = (role?: MembershipRole) => (role ? role.replace(/_/g, " ") : "Member");

/** Premium white sidebar — fixed header / scrollable grouped body / footer. */
export function AppSidebar({ user, collapsed, className }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen flex-col border-r border-rail-border bg-rail text-rail-foreground transition-[width] duration-200 ease-out",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Fixed header — bottom divider aligns to the page header height (h-16). */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-rail-border",
          collapsed ? "justify-center px-0" : "px-4",
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <BrandMark />
          {!collapsed && (
            <span className="flex flex-col leading-none">
              <span className="bg-linear-to-r from-accent-strong to-tertiary-accent bg-clip-text font-display text-base font-semibold text-transparent">
                Vellora
              </span>
              <span className="mt-1 text-[10px] font-medium tracking-wide text-faint">
                Workforce OS
              </span>
            </span>
          )}
        </Link>
      </div>

      {/* User block — avatar + name, role on the line below. */}
      <UserBlock user={user} collapsed={collapsed} />

      {/* 90%-width hairline divider (not full width). */}
      <div className="mx-auto h-px w-[90%] bg-rail-border" />

      {/* Grouped scrollable middle. */}
      <SidebarNav role={user.role} isPlatform={Boolean(user.platformRole)} collapsed={collapsed} />

      {/* Fixed footer — Settings / Logout. */}
      <SidebarFooter
        collapsed={collapsed}
        canSettings={user.role === "owner" || user.role === "hr"}
      />
    </aside>
  );
}

function UserBlock({ user, collapsed }: { user: CurrentUser; collapsed: boolean }) {
  const name = user.name?.trim() || user.email;
  const block = (
    <div className={cn("flex items-center gap-3 px-4 py-3", collapsed && "justify-center px-0")}>
      <EntityAvatar name={name} className="size-9" ring />
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{name}</p>
          <p className="truncate text-xs text-foreground-2 capitalize">{roleLabel(user.role)}</p>
        </div>
      )}
    </div>
  );

  if (!collapsed) return block;
  return (
    <Tooltip>
      <TooltipTrigger render={block} />
      <TooltipContent>
        {name} · <span className="capitalize">{roleLabel(user.role)}</span>
      </TooltipContent>
    </Tooltip>
  );
}

function SidebarFooter({ collapsed, canSettings }: { collapsed: boolean; canSettings: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await signOut();
    setActiveCompanyId(null);
    queryClient.clear();
    router.replace("/login");
    router.refresh();
  };

  const itemClass = cn(
    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rail-muted transition-[color,background-color,transform] duration-150 hover:bg-surface-subtle hover:text-rail-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none active:scale-[0.98]",
    collapsed && "justify-center px-0",
  );

  const settings = canSettings ? (
    <Link href="/settings" className={itemClass}>
      <Settings className="size-4.5 shrink-0" />
      {!collapsed && <span>Settings</span>}
    </Link>
  ) : null;

  const logout = (
    <button type="button" onClick={handleSignOut} className={cn(itemClass, "hover:text-danger")}>
      <LogOut className="size-4.5 shrink-0" />
      {!collapsed && <span>Logout</span>}
    </button>
  );

  return (
    <div className="flex shrink-0 flex-col gap-0.5 border-t border-rail-border p-3">
      {collapsed ? (
        <>
          {settings ? (
            <Tooltip>
              <TooltipTrigger render={settings} />
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
          ) : null}
          <Tooltip>
            <TooltipTrigger render={logout} />
            <TooltipContent>Logout</TooltipContent>
          </Tooltip>
        </>
      ) : (
        <>
          {settings}
          {logout}
        </>
      )}
    </div>
  );
}
