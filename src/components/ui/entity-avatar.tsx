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
}

/**
 * The signature initials avatar (UI-1): accent-gradient fill + hairline accent
 * ring + accent text, all theme-reactive (via the `.avatar-accent` class in
 * dashboard.css). Reused app-wide — header company block, sidebar user, and the
 * rich dropdowns (UI-2). When `src` is present it shows the image instead.
 */
export function EntityAvatar({ name, src, className, textClassName }: EntityAvatarProps) {
  return (
    <Avatar className={cn("avatar-ring", className)}>
      {src ? <AvatarImage src={src} alt={name ?? ""} /> : null}
      <AvatarFallback className={cn("avatar-accent font-semibold", textClassName)}>
        {entityInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
