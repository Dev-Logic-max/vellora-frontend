"use client";

import {
  ArrowRight,
  Check,
  Copy,
  MapPin,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AvatarStack } from "@/components/ui/avatar-stack";
import { Button } from "@/components/ui/button";
import { CapacityBar } from "@/components/stores/capacity-bar";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { Flag } from "@/components/ui/flag";
import { StatusPill } from "@/components/ui/status-pill";
import { useRouter } from "@/i18n/navigation";
import { categoryByKey } from "@/features/org/categories";
import { countryCode } from "@/lib/geo/countries";
import { storeMoney } from "@/lib/store-metrics";
import { cn } from "@/lib/utils";
import type { Store } from "@/features/org/types";

/**
 * A premium, store-looking card (3-up on large screens). Category-themed banner +
 * overlapping logo, name + flag + head-store star, copyable code, location, mock
 * revenue/visitors mini-stats, a capacity meter, and a Details button → store
 * detail page.
 */
export function StoreCard({ store }: { store: Store }) {
  const router = useRouter();
  const cc = countryCode(store.country);
  const location = [store.city, store.state].filter(Boolean).join(", ");
  const category = categoryByKey(store.category);
  const money = storeMoney(store.id);
  const open = () => router.push(`/stores/${store.id}`);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
      {/* Banner — store image or category gradient. */}
      <div className="relative h-24 w-full overflow-hidden">
        {store.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={store.bannerUrl} alt="" className="size-full object-cover" />
        ) : (
          <div
            className={cn(
              "size-full bg-linear-to-br",
              category?.gradient ?? "from-indigo-500/85 to-violet-600/85",
            )}
            style={
              category
                ? {
                    backgroundImage: `url(/categories/${category.key}.jpg)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          />
        )}
        <span className="absolute inset-0 bg-black/15" />
        <span className="absolute top-3 right-3">
          <StatusPill status={store.status} />
        </span>
        {category ? (
          <span className="absolute bottom-2 left-3 inline-flex items-center gap-1 rounded-full bg-black/35 px-2 py-0.5 text-[10px] font-medium text-white capitalize backdrop-blur-sm">
            <category.icon className="size-3" />
            {category.label}
          </span>
        ) : null}
      </div>

      <div className="px-5 pb-5">
        {/* Logo overlapping banner; name + flag + star. */}
        <div className="-mt-7 flex items-end gap-3">
          <EntityAvatar
            name={store.name}
            src={store.logoUrl}
            className="size-14 rounded-xl ring-4 ring-surface"
          />
          <div className="min-w-0 pb-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-display text-base font-semibold text-foreground">
                {store.name}
              </h3>
              {store.headStore ? (
                <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
              ) : null}
              {cc ? <Flag code={cc} className="h-3 w-4.5 shrink-0 rounded-xs" /> : null}
            </div>
            {store.code ? <CopyCode code={store.code} /> : null}
          </div>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-xs text-foreground-2">
          <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{location || "No location set"}</span>
        </p>

        {/* Mock revenue / visitors mini-stats. */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-surface-subtle/40 px-3 py-2.5">
            <p className="text-xs text-muted-foreground">Revenue (mtd)</p>
            <div className="mt-0.5 flex items-baseline justify-between">
              <span className="font-display text-lg font-semibold text-foreground tabular-nums">
                {storeMoney.format(money.revenue)}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-[11px] font-medium tabular-nums",
                  money.revenueChange >= 0 ? "text-emerald-600" : "text-rose-500",
                )}
              >
                {money.revenueChange >= 0 ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                {Math.abs(money.revenueChange)}%
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface-subtle/40 px-3 py-2.5">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="size-3.5" /> Team
            </p>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-display text-lg font-semibold text-foreground tabular-nums">
                {store.employeeCount ?? 0}
              </span>
              <AvatarStack
                items={store.employeeAvatars ?? []}
                total={store.employeeCount ?? 0}
                max={3}
              />
            </div>
          </div>
        </div>

        <div className="mt-3">
          <p className="mb-1 text-xs text-muted-foreground">Capacity</p>
          <CapacityBar used={store.employeeCount ?? 0} max={store.capacity} />
        </div>

        <Button variant="outline" className="mt-4 w-full" onClick={open}>
          Details
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

/** Mono code — click to copy. */
function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard?.writeText(code).then(
          () => {
            setCopied(true);
            toast.success(`Copied ${code}`);
            setTimeout(() => setCopied(false), 1200);
          },
          () => toast.error("Couldn't copy"),
        );
      }}
      title="Click to copy code"
      className="group/code mt-0.5 inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-accent-strong"
    >
      {code}
      {copied ? (
        <Check className="size-3 text-emerald-500" />
      ) : (
        <Copy className="size-3 opacity-0 transition-opacity group-hover/code:opacity-70" />
      )}
    </button>
  );
}
