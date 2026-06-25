"use client";

import { useState, type ReactNode } from "react";
import { CalendarRange, Copy, Plus } from "lucide-react";
import { addDays, format } from "date-fns";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { TimeField } from "@/components/ui/time-picker";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  useApplyTemplate,
  useCopyWeek,
  useCreateTemplate,
  useTemplates,
} from "@/features/scheduling/scheduling";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export function TemplatesPanel({
  storeId,
  weekStart,
  trigger,
}: {
  storeId: string;
  weekStart: string; // yyyy-MM-dd (Monday)
  trigger: ReactNode;
}) {
  const { data: templates } = useTemplates();
  const apply = useApplyTemplate();
  const copy = useCopyWeek();
  const createTemplate = useCreateTemplate();

  const [name, setName] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [selectedDays, setSelectedDays] = useState<string[]>(["mon", "tue", "wed", "thu", "fri"]);

  const prevWeek = format(addDays(new Date(`${weekStart}T00:00:00Z`), -7), "yyyy-MM-dd");

  const toggleDay = (d: string) =>
    setSelectedDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const create = async () => {
    if (!name.trim()) return;
    const pattern: Record<string, { start: string; end: string }[]> = {};
    for (const d of selectedDays) pattern[d] = [{ start, end }];
    await createTemplate.mutateAsync({ name, storeId, pattern });
    setName("");
  };

  return (
    <Sheet>
      <SheetTrigger render={trigger as React.ReactElement} />
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Templates</SheetTitle>
          <SheetDescription>Fill the current week from a saved pattern.</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 p-4">
          <Button
            variant="outline"
            className="w-full"
            disabled={copy.isPending}
            onClick={() =>
              void copy.mutateAsync({ storeId, fromWeekStart: prevWeek, toWeekStart: weekStart })
            }
          >
            <Copy />
            Copy previous week
          </Button>

          <section className="space-y-2">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Saved templates
            </h3>
            {templates && templates.length > 0 ? (
              <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                {templates.map((t) => (
                  <div key={t.id} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="flex items-center gap-2">
                      <CalendarRange className="size-4 text-muted-foreground" />
                      {t.name}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={apply.isPending}
                      onClick={() => void apply.mutateAsync({ id: t.id, storeId, weekStart })}
                    >
                      Apply
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No templates yet.</p>
            )}
          </section>

          <section className="space-y-3 border-t border-border pt-4">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              New template
            </h3>
            <FormField id="t-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <TimeField id="t-start" label="Start" value={start} onChange={setStart} />
              <TimeField id="t-end" label="End" value={end} onChange={setEnd} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={cn(
                    "h-8 w-11 rounded-lg border text-xs font-medium capitalize",
                    selectedDays.includes(d)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
            <Button onClick={create} disabled={!name.trim() || createTemplate.isPending}>
              <Plus />
              Save template
            </Button>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
