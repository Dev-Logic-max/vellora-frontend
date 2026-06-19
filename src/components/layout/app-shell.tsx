"use client";

import { useEffect, useState, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { Toaster } from "sonner";

import { RealtimeNotifications } from "@/components/notifications/realtime-notifications";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/features/session/use-current-user";
import { AppSidebar } from "./app-sidebar";
import { CommandPalette } from "./command-palette";
import { MobileNav } from "./mobile-nav";
import { TopBar } from "./top-bar";
import { useSidebarCollapsed } from "./use-sidebar-collapsed";

export function AppShell({ children }: { children: ReactNode }) {
  const { data: user, isLoading, isError, refetch, isFetching } = useCurrentUser();
  const [collapsed, toggleCollapsed] = useSidebarCollapsed();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Cmd/Ctrl-K toggles the super-search palette.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (isLoading) return <ShellSkeleton />;

  if (isError || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="flex max-w-sm flex-col items-center text-center">
          <span className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-danger-soft text-danger">
            <TriangleAlert className="size-6" />
          </span>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Couldn&apos;t load your session
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We couldn&apos;t reach the Vellora API. Check that the backend is running, then retry.
          </p>
          <Button className="mt-5" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? "Retrying…" : "Retry"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        role={user.role}
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        className="hidden lg:flex"
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar
          user={user}
          onOpenMobileNav={() => setMobileOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
      <MobileNav role={user.role} open={mobileOpen} onOpenChange={setMobileOpen} />
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
      <RealtimeNotifications />
      <Toaster position="bottom-right" theme="light" richColors closeButton />
    </div>
  );
}

function ShellSkeleton() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden w-64 flex-col gap-2 bg-rail p-4 lg:flex">
        <Skeleton className="h-8 w-32 bg-white/10" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full bg-white/10" />
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <Skeleton className="h-7 w-40" />
          <div className="flex-1" />
          <Skeleton className="size-8 rounded-full" />
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
