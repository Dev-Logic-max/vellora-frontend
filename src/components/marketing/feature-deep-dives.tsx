import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  PlaneTakeoff,
  ScanLine,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Reveal } from "@/components/marketing/reveal";
import { ScheduleMockup } from "@/components/marketing/mockups/schedule-mockup";
import { AttendanceMockup } from "@/components/marketing/mockups/attendance-mockup";
import { LeaveMockup } from "@/components/marketing/mockups/leave-mockup";
import { AtsMockup } from "@/components/marketing/mockups/ats-mockup";

// Icon + mockup per row, paired with translated copy by index.
const META: { id: string; icon: LucideIcon; mockup: ReactNode }[] = [
  { id: "scheduling", icon: CalendarDays, mockup: <ScheduleMockup /> },
  { id: "attendance", icon: ScanLine, mockup: <AttendanceMockup /> },
  { id: "leave", icon: PlaneTakeoff, mockup: <LeaveMockup /> },
  { id: "recruiting", icon: Briefcase, mockup: <AtsMockup /> },
];

type Item = { eyebrow: string; title: string; description: string; points: string[] };

function DeepDiveRow({
  item,
  icon: Icon,
  mockup,
  reversed,
}: {
  item: Item;
  icon: LucideIcon;
  mockup: ReactNode;
  reversed: boolean;
}) {
  return (
    <Reveal className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      {/* Text */}
      <div className={cn(reversed && "lg:order-2")}>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <Icon className="size-4" />
          {item.eyebrow}
        </span>
        <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
          {item.title}
        </h3>
        <p className="mt-4 text-pretty text-muted-foreground">{item.description}</p>
        <ul className="mt-6 space-y-3">
          {item.points.map((point) => (
            <li key={point} className="flex items-center gap-3 text-sm text-foreground">
              <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ArrowRight className="size-3" />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Mockup */}
      <div className={cn(reversed && "lg:order-1")}>{mockup}</div>
    </Reveal>
  );
}

export function FeatureDeepDives() {
  const t = useTranslations("DeepDives");
  const items = t.raw("items") as Item[];

  return (
    <section className="border-t border-border bg-muted/20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 py-20 sm:gap-28 sm:py-28">
        {items.map((item, i) => (
          <DeepDiveRow
            key={META[i].id}
            item={item}
            icon={META[i].icon}
            mockup={META[i].mockup}
            reversed={i % 2 === 1}
          />
        ))}
      </div>
    </section>
  );
}
