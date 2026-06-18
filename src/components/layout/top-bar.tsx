"use client";

import { Bell, Menu, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CurrentUser } from "@/features/session/types";
import { CompanySwitcher } from "./company-switcher";
import { UserMenu } from "./user-menu";

interface TopBarProps {
  user: CurrentUser;
  onOpenMobileNav: () => void;
}

export function TopBar({ user, onOpenMobileNav }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-sm sm:px-6">
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

      {/* Super-search trigger (cmdk palette wired in Phase 1). */}
      <button
        type="button"
        disabled
        className="hidden items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted disabled:opacity-70 sm:flex"
      >
        <Search className="size-4" />
        <span>Search…</span>
        <kbd className="ml-3 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <Button variant="ghost" size="icon" aria-label="Notifications" disabled>
        <Bell />
      </Button>

      <UserMenu user={user} />
    </header>
  );
}
