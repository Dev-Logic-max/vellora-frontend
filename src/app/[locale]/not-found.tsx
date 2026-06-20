import { Compass } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/** 404 page for unmatched routes under a locale. */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-accent-strong">
        <Compass className="size-7" />
      </span>
      <p className="font-mono text-sm font-semibold text-muted-foreground">404</p>
      <h1 className="mt-1 font-display text-xl font-semibold text-foreground">Page not found</h1>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Button render={<Link href="/dashboard" />} className="mt-6">
        Back to dashboard
      </Button>
    </div>
  );
}
