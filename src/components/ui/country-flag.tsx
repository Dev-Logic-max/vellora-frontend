import { cn } from "@/lib/utils";

/** Emoji flag from a 2-letter ISO-3166 code (regional-indicator pair). */
export function flagEmoji(code?: string | null): string | null {
  const cc = code?.trim().toUpperCase();
  if (!cc || cc.length !== 2 || !/^[A-Z]{2}$/.test(cc)) return null;
  return String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/**
 * Country chip: emoji flag + code (uppercased). Falls back to the raw value
 * when the code isn't a valid 2-letter ISO code.
 */
export function CountryFlag({
  code,
  showCode = true,
  className,
}: {
  code?: string | null;
  showCode?: boolean;
  className?: string;
}) {
  const flag = flagEmoji(code);
  if (!code) return <span className="text-muted-foreground">—</span>;
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {flag ? <span className="text-base leading-none">{flag}</span> : null}
      {showCode ? <span className="text-foreground uppercase">{code}</span> : null}
    </span>
  );
}
