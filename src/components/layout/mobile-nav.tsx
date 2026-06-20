"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { MembershipRole } from "@/features/session/types";
import { BrandMark } from "./brand-mark";
import { SidebarNav } from "./sidebar-nav";

interface MobileNavProps {
  role?: MembershipRole;
  isPlatform?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Slide-in drawer mirroring the rail nav, for small screens. */
export function MobileNav({ role, isPlatform, open, onOpenChange }: MobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="app-shell w-72 border-r border-rail-border bg-rail p-0 text-rail-foreground"
      >
        <SheetHeader className="h-16 flex-row items-center gap-2.5 px-4">
          <BrandMark />
          <SheetTitle className="font-display text-base font-semibold text-foreground">
            Vellora
          </SheetTitle>
        </SheetHeader>
        <SidebarNav role={role} isPlatform={isPlatform} onNavigate={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}
