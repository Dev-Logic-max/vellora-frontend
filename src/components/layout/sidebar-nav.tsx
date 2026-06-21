"use client";

import { motion, useReducedMotion } from "framer-motion";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { MembershipRole } from "@/features/session/types";
import { navGroupsForRole, type NavItem } from "./nav-config";

interface SidebarNavProps {
  role?: MembershipRole;
  /** Show the platform Admin console entry (cross-tenant operators). */
  isPlatform?: boolean;
  collapsed?: boolean;
  /** Called after navigating — used to close the mobile drawer. */
  onNavigate?: () => void;
}

// One shared id so the active highlight slides between items (shared layout
// animation). Only used when expanded; collapsed items don't share the layout.
const HIGHLIGHT_ID = "sidebar-active-highlight";

export function SidebarNav({
  role,
  isPlatform = false,
  collapsed = false,
  onNavigate,
}: SidebarNavProps) {
  const pathname = usePathname();
  const groups = navGroupsForRole(role, isPlatform);
  const reduceMotion = useReducedMotion();

  // Pick exactly ONE active item: the visible item whose href is the LONGEST
  // prefix of the current path. This prevents a parent (e.g. /settings) from
  // also lighting up when a child (e.g. /settings/design) is the real match.
  const activeHref = (() => {
    const candidates = groups
      .flatMap((g) => g.items)
      .filter((item) => !item.soon)
      .map((item) => item.href)
      .filter((href) => pathname === href || pathname.startsWith(`${href}/`));
    return candidates.sort((a, b) => b.length - a.length)[0];
  })();

  const isActive = (href: string) => href === activeHref;

  return (
    <nav className="scrollbar-hidden flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-3">
      {groups.map((group, gi) => (
        <div key={group.title} className="flex flex-col gap-1">
          {collapsed ? (
            // Collapsed: thin divider between groups instead of headings.
            gi > 0 ? <div className="mx-2 mb-1 h-px bg-rail-border" /> : null
          ) : (
            <p className="px-3 pb-1 text-[10px] font-semibold tracking-[0.08em] text-faint uppercase">
              {group.title}
            </p>
          )}

          {group.items.map((item) =>
            item.soon ? (
              <SoonItem key={item.href} item={item} collapsed={collapsed} />
            ) : (
              <NavLink
                key={item.href}
                item={item}
                active={isActive(item.href)}
                collapsed={collapsed}
                reduceMotion={Boolean(reduceMotion)}
                onNavigate={onNavigate}
              />
            ),
          )}
        </div>
      ))}
    </nav>
  );
}

function NavLink({
  item,
  active,
  collapsed,
  reduceMotion,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  reduceMotion: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        // Subtle hover bounce (lift + soft accent shadow) on every item.
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-[color,transform,box-shadow] duration-150 ease-out active:scale-[0.98] motion-safe:hover:-translate-y-px",
        active
          ? "text-primary"
          : "text-rail-muted hover:bg-surface-subtle hover:text-rail-foreground motion-safe:hover:shadow-accent-sm",
        collapsed && "justify-center px-0",
      )}
    >
      {active && (
        <>
          <motion.span
            layoutId={collapsed ? undefined : HIGHLIGHT_ID}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 520, damping: 40, mass: 0.7 }
            }
            className="absolute inset-0 -z-10 rounded-lg border border-accent/25 bg-accent-soft shadow-accent-sm"
          />
          {/* Left accent rail — slides with the highlight (own layoutId). */}
          {!collapsed && (
            <motion.span
              layoutId={`${HIGHLIGHT_ID}-bar`}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 520, damping: 40, mass: 0.7 }
              }
              className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
            />
          )}
        </>
      )}
      <Icon className="size-4.5 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent>{item.label}</TooltipContent>
    </Tooltip>
  );
}

function SoonItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const Icon = item.icon;
  const content = (
    <span
      aria-disabled
      className={cn(
        "flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-faint",
        collapsed && "justify-center px-0",
      )}
    >
      <Icon className="size-4.5 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          <span className="rounded-full bg-surface-subtle px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted uppercase">
            Soon
          </span>
        </>
      )}
    </span>
  );

  if (!collapsed) return content;
  return (
    <Tooltip>
      <TooltipTrigger render={content} />
      <TooltipContent>{item.label} — coming soon</TooltipContent>
    </Tooltip>
  );
}
