"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SelectField } from "@/components/ui/select-field";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

/** A single filter control rendered inside the filter modal. */
export interface FilterField {
  /** Key in the filter-values record. */
  key: string;
  label: string;
  type: "select";
  options: FilterOption[];
  placeholder?: string;
}

export type FilterValues = Record<string, string | undefined>;

/** True when any field has a non-empty value (drives the Reset affordance). */
export function hasActiveFilters(values: FilterValues): boolean {
  return Object.values(values).some((v) => v != null && v !== "");
}

interface FilterModalProps {
  fields: FilterField[];
  /** Currently-applied values (committed). */
  values: FilterValues;
  /** Called with the new values when the user clicks Apply. */
  onApply: (values: FilterValues) => void;
  /** Optional trigger override; defaults to a Filter button with an active dot. */
  trigger?: React.ReactNode;
}

/**
 * Centered modal holding all of a table's filter controls. Edits are staged
 * locally and only committed on Apply (Reset clears them in-modal). The toolbar's
 * instant Reset (next to search) is handled by the caller via `onApply({})`.
 */
export function FilterModal({ fields, values, onApply, trigger }: FilterModalProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterValues>(values);

  const active = hasActiveFilters(values);
  const activeCount = Object.values(values).filter((v) => v != null && v !== "").length;

  // Seed the draft from the committed values when opening (no effect needed).
  const openModal = () => {
    setDraft(values);
    setOpen(true);
  };

  const apply = () => {
    onApply(draft);
    setOpen(false);
  };
  const reset = () => setDraft({});

  return (
    <>
      {trigger ? (
        <span onClick={openModal}>{trigger}</span>
      ) : (
        <Button variant="outline" onClick={openModal} className="relative">
          <SlidersHorizontal />
          Filter
          {active ? (
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-soft px-1 text-xs font-semibold text-accent-strong">
              {activeCount}
            </span>
          ) : null}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {fields.map((field) => (
              <SelectField
                key={field.key}
                id={`filter-${field.key}`}
                label={field.label}
                placeholder={field.placeholder ?? `All ${field.label.toLowerCase()}`}
                options={field.options}
                value={draft[field.key] ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, [field.key]: e.target.value || undefined }))
                }
              />
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={reset}
              className={cn(!hasActiveFilters(draft) && "invisible")}
            >
              Clear all
            </Button>
            <Button onClick={apply}>Apply filters</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
