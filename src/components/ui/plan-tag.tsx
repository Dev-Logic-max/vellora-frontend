import { Crown, Gem, Rocket, Sparkles, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Plan chip — a gradient pill per plan tier. Colors are FIXED (theme-independent)
 * so a plan reads the same hue everywhere (companies table, admin tenants).
 * Keyed by a normalized plan name; unknown plans fall back to a neutral slate.
 */
type PlanStyle = {
  gradient: string; // `from-… to-…`
  ring: string; // border tint
  icon: typeof Crown;
};

const PLAN_STYLES: Record<string, PlanStyle> = {
  free: {
    gradient: "from-slate-100 to-slate-200 text-slate-700",
    ring: "border-slate-300/70",
    icon: Sparkles,
  },
  starter: {
    gradient: "from-sky-500 to-cyan-500 text-white",
    ring: "border-sky-300/60",
    icon: Zap,
  },
  growth: {
    gradient: "from-emerald-500 to-teal-500 text-white",
    ring: "border-emerald-300/60",
    icon: Rocket,
  },
  pro: {
    gradient: "from-indigo-500 via-violet-500 to-purple-500 text-white",
    ring: "border-violet-300/60",
    icon: Rocket,
  },
  business: {
    gradient: "from-amber-500 via-orange-500 to-rose-500 text-white",
    ring: "border-amber-300/60",
    icon: Crown,
  },
  enterprise: {
    gradient: "from-fuchsia-600 via-purple-600 to-indigo-600 text-white",
    ring: "border-fuchsia-300/60",
    icon: Gem,
  },
  custom: {
    gradient: "from-zinc-700 to-zinc-900 text-white",
    ring: "border-zinc-400/50",
    icon: Gem,
  },
};

const FALLBACK: PlanStyle = {
  gradient: "from-slate-100 to-slate-200 text-slate-700",
  ring: "border-slate-300/70",
  icon: Sparkles,
};

function styleFor(plan: string): PlanStyle {
  const key = plan.trim().toLowerCase();
  return PLAN_STYLES[key] ?? FALLBACK;
}

export function PlanTag({
  plan,
  className,
}: {
  plan?: string | null;
  className?: string;
}) {
  const name = plan?.trim() || "Free";
  const s = styleFor(name);
  const Icon = s.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border bg-linear-to-r px-2.5 py-0.5 text-xs font-semibold shadow-sm",
        s.gradient,
        s.ring,
        className,
      )}
    >
      <Icon className="size-3" />
      {name}
    </span>
  );
}
