"use client";

import { Check, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { THEME_PACKS } from "@/features/design/design";

/**
 * Theme packs gallery. Aurora is the active default (free on every plan); the
 * rest are "coming soon" and will be plan-gated (`theme_packs`) when shipped.
 */
export function ThemePacksTab() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {THEME_PACKS.map((pack) => {
        const isActive = pack.status === "active";
        return (
          <Card
            key={pack.key}
            className={isActive ? "ring-1 ring-primary" : "opacity-90"}
          >
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">{pack.label}</CardTitle>
              {isActive ? (
                <Badge>
                  <Check className="size-3" /> Active
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  <Lock className="size-3" /> Soon
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-1.5">
                {pack.swatches.map((triple, i) => (
                  <span
                    key={i}
                    className="size-8 rounded-md border border-border"
                    style={{ backgroundColor: `rgb(${triple})` }}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{pack.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
