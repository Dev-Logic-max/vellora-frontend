"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { MembershipRole } from "@/features/session/types";
import { BrandMark } from "./brand-mark";
import { SidebarNav } from "./sidebar-nav";

interface MobileNavProps {
  role?: MembershipRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Slide-in drawer mirroring the rail nav, for small screens. */
export function MobileNav({ role, open, onOpenChange }: MobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 bg-rail p-0 text-rail-foreground">
        <SheetHeader className="h-16 flex-row items-center gap-2.5 px-4">
          <BrandMark />
          <SheetTitle className="font-display text-base font-semibold text-white">
            Vellora
          </SheetTitle>
        </SheetHeader>
        <SidebarNav role={role} onNavigate={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}
