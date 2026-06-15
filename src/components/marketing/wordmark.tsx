import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

/**
 * Vellora wordmark — accent-colored text logo (placeholder for a real mark).
 * Reused by the NavBar and Footer so the brand stays consistent in one place.
 */
export function Wordmark({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      aria-label="Vellora home"
      className={cn(
        "font-display text-lg font-semibold tracking-tight text-primary transition-opacity hover:opacity-80",
        className,
      )}
    >
      Vellora
    </Link>
  );
}
