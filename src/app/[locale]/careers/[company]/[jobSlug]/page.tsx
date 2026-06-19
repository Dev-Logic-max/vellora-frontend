import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";

import { ApplyForm } from "@/components/careers/apply-form";
import { fetchCareersJob } from "@/features/careers/api";

interface Params {
  params: Promise<{ locale: string; company: string; jobSlug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { company, jobSlug } = await params;
  const data = await fetchCareersJob(company, jobSlug);
  if (!data) return { title: "Position not found" };
  return {
    title: `${data.job.title} — ${data.company.name}`,
    description: data.job.description.slice(0, 160),
    openGraph: { title: `${data.job.title} — ${data.company.name}`, type: "article" },
  };
}

export default async function CareersJobPage({ params }: Params) {
  const { company, jobSlug, locale } = await params;
  const data = await fetchCareersJob(company, jobSlug);
  if (!data) notFound();

  const { job } = data;

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-5 py-12">
      <Link
        href={`/${locale}/careers/${company}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All positions
      </Link>

      <header className="mt-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">{job.title}</h1>
        <p className="mt-2 flex items-center gap-1 text-muted-foreground">
          <MapPin className="size-4" />
          {job.location ?? "Flexible"} · {job.employmentType.replace(/_/g, " ")}
        </p>
      </header>

      <article className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {job.description}
      </article>

      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl font-semibold text-foreground">Apply</h2>
        <ApplyForm
          companySlug={company}
          jobSlug={job.slug}
          screenerQuestions={job.screenerQuestions}
        />
      </section>
    </main>
  );
}
