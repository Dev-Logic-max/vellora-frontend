import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/** Initials from a free-form name/email — up to two letters, falls back to "?". */
export function entityInitials(name?: string | null): string {
  const base = name?.trim();
  if (!base) return "?";
  return (
    base
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

interface EntityAvatarProps {
  /** Display name (companies, stores, users) — used for initials + alt text. */
  name?: string | null;
  /** Optional photo/logo; falls through to the gradient initials fallback. */
  src?: string | null;
  className?: string;
  /** Initials text size; defaults to the avatar size's natural scale. */
  textClassName?: string;
  /**
   * Prominent ring style: a white gap + a slightly thicker accent ring (the
   * "floating" look). Opt-in — used ONLY for the header + sidebar-top user
   * avatars. Everywhere else (tables, company/store logos, dropdowns) gets the
   * default subtle hairline.
   */
  ring?: boolean;
}

/**
 * The signature initials avatar (UI-1): accent-gradient fill + accent text, all
 * theme-reactive (via the `.avatar-accent` class in dashboard.css). Default has
 * a subtle hairline; pass `ring` for the prominent white-gap ring (header +
 * sidebar user only). When `src` is present it shows the image instead.
 */
export function EntityAvatar({ name, src, className, textClassName, ring }: EntityAvatarProps) {
  return (
    <Avatar className={cn(ring ? "avatar-ring-prominent" : "avatar-ring", className)}>
      {src ? <AvatarImage src={src} alt={name ?? ""} /> : null}
      <AvatarFallback className={cn("avatar-accent font-semibold", textClassName)}>
        {entityInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
