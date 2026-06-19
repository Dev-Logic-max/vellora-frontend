"use client";

import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useSign } from "@/features/documents/documents";

/** Sign modal with typed or drawn signature + an explicit consent toggle. */
export function ESignModal({
  signatureId,
  documentName,
  trigger,
}: {
  signatureId: string;
  documentName: string;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"typed" | "drawn">("typed");
  const [typed, setTyped] = useState("");
  const [consent, setConsent] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const sign = useSign();

  const draw = (e: React.PointerEvent<HTMLCanvasElement>, start: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (start) {
      drawing.current = true;
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (drawing.current) {
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#1f2937";
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current)
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const submit = () => {
    if (!consent) return;
    const value = mode === "typed" ? typed.trim() : (canvasRef.current?.toDataURL() ?? "");
    if (mode === "typed" && !value) return;
    sign.mutate(
      { signatureId, method: mode, value },
      {
        onSuccess: () => {
          toast.success("Signed");
          setOpen(false);
        },
        onError: () => toast.error("Couldn't record the signature"),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sign document</DialogTitle>
          <DialogDescription>{documentName}</DialogDescription>
        </DialogHeader>

        <div className="mb-3 inline-flex rounded-lg border border-border p-0.5 text-sm">
          {(["typed", "drawn"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "rounded-md px-3 py-1 capitalize transition-colors",
                mode === m ? "bg-accent-soft text-accent-strong" : "text-muted-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === "typed" ? (
          <FormField
            id="sign-typed"
            label="Type your full name"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Jane Doe"
          />
        ) : (
          <div className="space-y-2">
            <canvas
              ref={canvasRef}
              width={400}
              height={140}
              onPointerDown={(e) => draw(e, true)}
              onPointerMove={(e) => draw(e, false)}
              onPointerUp={() => (drawing.current = false)}
              onPointerLeave={() => (drawing.current = false)}
              className="w-full touch-none rounded-lg border border-border bg-surface"
            />
            <button
              type="button"
              onClick={clearCanvas}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
        )}

        <label className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Switch checked={consent} onCheckedChange={setConsent} />
          I consent to sign this document electronically.
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!consent || sign.isPending}>
            {sign.isPending ? "Signing…" : "Sign"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
