"use client";

import { CreditCard } from "lucide-react";

import { usePortal, useSubscription } from "@/features/billing/billing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";

export function CurrentPlanCard() {
  const { data, isLoading } = useSubscription();
  const portal = usePortal();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-xl font-semibold text-foreground">
                  {data?.plan?.name ?? "Free"}
                </p>
                <p className="text-sm text-muted-foreground capitalize">
                  Billed {data?.interval === "year" ? "annually" : "monthly"}
                </p>
              </div>
              <StatusPill status={data?.status ?? "active"} />
            </div>
            {data?.currentPeriodEnd ? (
              <p className="text-xs text-muted-foreground">
                Renews {new Date(data.currentPeriodEnd).toLocaleDateString()}
              </p>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={() => portal.mutate()}
              disabled={portal.isPending}
            >
              <CreditCard className="size-4" />
              Manage billing
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
