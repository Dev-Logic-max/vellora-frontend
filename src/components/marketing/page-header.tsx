import { Reveal } from "@/components/marketing/reveal";

/** Standard centered page header for secondary marketing pages. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      {eyebrow && <p className="text-sm font-semibold text-primary">{eyebrow}</p>}
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
        {title}
      </h1>
      {subtitle && <p className="mt-4 text-pretty text-muted-foreground">{subtitle}</p>}
    </Reveal>
  );
}
