"use client";

import { useEffect, useState } from "react";
import { Menu, PanelLeft, PanelLeftClose, Search } from "lucide-react";

import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/features/session/types";
import { CompanySwitcher } from "./company-switcher";
import { UserMenu } from "./user-menu";

interface TopBarProps {
  user: CurrentUser;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onOpenMobileNav: () => void;
  onOpenSearch: () => void;
}

export function TopBar({
  user,
  collapsed,
  onToggleCollapsed,
  onOpenMobileNav,
  onOpenSearch,
}: TopBarProps) {
  // Elevate the header with a light shadow once the page is scrolled.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-sm transition-shadow duration-200 sm:px-6",
        scrolled && "shadow-accent-md",
      )}
    >
      {/* Sidebar collapse/expand (desktop) — leftmost, before the company block. */}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex"
              onClick={onToggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            />
          }
        >
          {collapsed ? <PanelLeft /> : <PanelLeftClose />}
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {collapsed ? "Expand sidebar" : "Collapse sidebar"}
        </TooltipContent>
      </Tooltip>

      {/* Mobile nav trigger. */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
      >
        <Menu />
      </Button>

      <CompanySwitcher user={user} />

      <div className="flex-1" />

      {/* Super-search trigger (Cmd/Ctrl-K). */}
      <button
        type="button"
        onClick={onOpenSearch}
        className="hidden items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted sm:flex"
      >
        <Search className="size-4" />
        <span>Search…</span>
        <kbd className="ml-3 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden"
        onClick={onOpenSearch}
        aria-label="Search"
      >
        <Search />
      </Button>

      <NotificationBell />

      <UserMenu user={user} />
    </header>
  );
}
