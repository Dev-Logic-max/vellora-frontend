"use client";

import { useState } from "react";
import { BookOpen, Copy, MonitorSmartphone, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SelectField } from "@/components/ui/select-field";
import { useCompanies } from "@/features/org/companies";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2">
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground uppercase">{label}</p>
        <p className="truncate font-mono text-xs text-foreground">{value}</p>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Copy ${label}`}
        onClick={() => {
          void navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        }}
      >
        <Copy className={copied ? "text-success" : undefined} />
      </Button>
    </div>
  );
}

export function RegistrationGuideDialog() {
  const { data: companies } = useCompanies();
  const [companyId, setCompanyId] = useState("");
  const company = companies?.find((c) => c.id === companyId) ?? companies?.[0];
  const slug = company?.id ?? "your-company";

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <BookOpen />
        Registration guide
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Device registration guide</DialogTitle>
          <DialogDescription>
            Share these steps with staff and store managers to get clocking in.
          </DialogDescription>
        </DialogHeader>

        {companies && companies.length > 1 ? (
          <SelectField
            id="guide-company"
            label="Company"
            options={companies.map((c) => ({ value: c.id, label: c.name }))}
            value={companyId || company?.id || ""}
            onChange={(e) => setCompanyId(e.target.value)}
          />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Smartphone className="size-4 text-accent-strong" />
              Employee smartphone
            </div>
            <ol className="list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
              <li>Open the portal URL below and sign in.</li>
              <li>Go to My Profile → Register device.</li>
              <li>Allow camera access, then scan the store QR to clock in.</li>
            </ol>
            <CopyRow label="Portal URL" value={`${APP_URL}/portal?c=${slug}`} />
          </section>

          <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <MonitorSmartphone className="size-4 text-accent-strong" />
              Store terminal
            </div>
            <ol className="list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
              <li>Open the kiosk URL on the tablet at the store.</li>
              <li>Sign in with the store terminal credentials.</li>
              <li>Authorize the terminal — it then shows the rotating QR.</li>
            </ol>
            <CopyRow label="Kiosk URL" value={`${APP_URL}/kiosk?c=${slug}`} />
            <CopyRow label="Example login" value={`terminal@${slug}.vellora.app`} />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
