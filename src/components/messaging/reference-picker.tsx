"use client";

import { useState } from "react";
import { Link2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEmployees } from "@/features/employees/employees";
import type { MessageRef } from "@/features/messaging/types";

/** Pick a record to reference inline. v1 supports employee references. */
export function ReferencePicker({ onPick }: { onPick: (ref: MessageRef) => void }) {
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const { data: page } = useEmployees({ pageSize: 200 });

  const options =
    page?.data.map((e) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` })) ?? [];

  const attach = () => {
    if (!employeeId) return;
    const emp = page?.data.find((e) => e.id === employeeId);
    onPick({
      type: "employee",
      id: employeeId,
      label: emp ? `${emp.firstName} ${emp.lastName}` : undefined,
    });
    setEmployeeId(undefined);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Reference a record">
            <Link2 className="size-4" />
          </Button>
        }
      />
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Reference a record</DialogTitle>
        </DialogHeader>
        <Combobox
          options={options}
          value={employeeId}
          onChange={setEmployeeId}
          placeholder="Search employees…"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={attach} disabled={!employeeId}>
            Attach
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Inline preview of a staged reference in the composer, with a remove button. */
export function StagedRef({ refData, onClear }: { refData: MessageRef; onClear: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-subtle px-2.5 py-1 text-xs">
      <Link2 className="size-3.5 text-accent-strong" />
      <span className="text-foreground">{refData.label ?? refData.type}</span>
      <button type="button" onClick={onClear} aria-label="Remove reference">
        <X className="size-3.5 text-muted-foreground hover:text-foreground" />
      </button>
    </div>
  );
}
