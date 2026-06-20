import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Briefcase, MapPin } from "lucide-react";

import { fetchCareers } from "@/features/careers/api";

interface Params {
  params: Promise<{ locale: string; company: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { company } = await params;
  const data = await fetchCareers(company);
  const name = data?.company.name ?? "Careers";
  return {
    title: `${name} — Careers`,
    description: `Open positions at ${name}. Apply online.`,
    openGraph: { title: `${name} — Careers`, type: "website" },
  };
}

export default async function CareersPage({ params }: Params) {
  const { company, locale } = await params;
  const data = await fetchCareers(company);
  if (!data) notFound();

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-5 py-12">
      <header className="mb-10">
        <p className="text-sm font-medium text-primary">Careers</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
          Join {data.company.name}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {data.jobs.length} open position{data.jobs.length === 1 ? "" : "s"}.
        </p>
      </header>

      {data.jobs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center text-muted-foreground">
          No open positions right now. Check back soon.
        </p>
      ) : (
        <ul className="space-y-3">
          {data.jobs.map((job) => (
            <li key={job.slug}>
              <Link
                href={`/${locale}/careers/${company}/${job.slug}`}
                className="flex items-center justify-between rounded-xl bg-card p-5 ring-1 ring-foreground/10 transition-shadow hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-lg bg-accent-soft text-accent-strong">
                    <Briefcase className="size-5" />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{job.title}</p>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="size-3.5" />
                      {job.location ?? "Flexible"} · {job.employmentType.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-primary">View →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
