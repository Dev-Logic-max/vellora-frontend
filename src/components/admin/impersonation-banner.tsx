"use client";

import { UserCog } from "lucide-react";

import { useStopImpersonation } from "@/features/admin/admin";
import { setImpersonation, useImpersonation } from "@/features/admin/impersonation";
import { Button } from "@/components/ui/button";

/**
 * Persistent banner shown platform-wide while a platform operator is
 * impersonating a tenant. Stopping is audited server-side.
 */
export function ImpersonationBanner() {
  const state = useImpersonation();
  const stop = useStopImpersonation();
  if (!state) return null;

  return (
    <div className="flex items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950">
      <UserCog className="size-4" />
      <span>
        Impersonating <strong>{state.companyName}</strong>
      </span>
      <Button
        size="xs"
        variant="outline"
        className="border-amber-700/40 bg-amber-100/40 text-amber-950 hover:bg-amber-100"
        disabled={stop.isPending}
        onClick={() => stop.mutate(state.companyId, { onSuccess: () => setImpersonation(null) })}
      >
        Stop
      </Button>
    </div>
  );
}
