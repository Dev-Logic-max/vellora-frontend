"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

import type { PublicScreenerQuestion } from "@/features/careers/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030";

interface ApplyFormProps {
  companySlug: string;
  jobSlug: string;
  screenerQuestions: PublicScreenerQuestion[];
}

/**
 * Public application form (no account). Uploads the resume to a signed URL,
 * then submits the application with explicit GDPR consent. Mobile-first.
 */
export function ApplyForm({ companySlug, jobSlug, screenerQuestions }: ApplyFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function uploadResume(): Promise<string | undefined> {
    if (!resume) return undefined;
    const res = await fetch(`${API_URL}/api/careers/${companySlug}/resume-upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: resume.name }),
    });
    if (!res.ok) return undefined;
    const { url, storageKey } = (await res.json()) as { url: string; storageKey: string };
    // Best-effort PUT of the bytes to the signed URL (no-op in dev stub mode).
    try {
      await fetch(url, { method: "PUT", body: resume });
    } catch {
      /* dev stub URL — ignore */
    }
    return storageKey;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) return;
    setStatus("submitting");
    setError("");
    try {
      const resumeKey = await uploadResume();
      const res = await fetch(`${API_URL}/api/careers/${companySlug}/jobs/${jobSlug}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone: phone || undefined, resumeKey, answers, consent: true }),
      });
      if (!res.ok) throw new Error("Application failed. Please try again.");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl bg-success-soft p-6 text-center">
        <CheckCircle2 className="mx-auto size-8 text-success" />
        <h3 className="mt-3 font-display text-lg font-semibold text-foreground">Application sent</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Thanks for applying — we&apos;ll be in touch.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-ring focus:outline-none";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">Full name</label>
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Email</label>
        <input
          type="email"
          className={inputCls}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Phone (optional)</label>
        <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Resume (optional)</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          className="block w-full text-sm text-muted-foreground"
          onChange={(e) => setResume(e.target.files?.[0] ?? null)}
        />
      </div>

      {screenerQuestions.map((q) => (
        <div key={q.id}>
          <label className="text-sm font-medium text-foreground">
            {q.label}
            {q.required ? " *" : ""}
          </label>
          <input
            className={inputCls}
            required={q.required}
            value={answers[q.id] ?? ""}
            onChange={(e) => setAnswers((s) => ({ ...s, [q.id]: e.target.value }))}
          />
        </div>
      ))}

      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
        />
        I consent to {companySlug} storing and processing my application data for recruitment.
      </label>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <button
        type="submit"
        disabled={!consent || status === "submitting"}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {status === "submitting" ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
