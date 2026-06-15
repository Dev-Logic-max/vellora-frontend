import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { Reveal } from "@/components/marketing/reveal";

// Placeholder legal documents so footer links resolve. Replace with real copy.
const DOCS: Record<string, { title: string }> = {
  privacy: { title: "Privacy Policy" },
  terms: { title: "Terms of Service" },
  cookies: { title: "Cookie Policy" },
  dpa: { title: "Data Processing Addendum" },
};

export function generateStaticParams() {
  return Object.keys(DOCS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = DOCS[slug];
  return { title: doc ? `${doc.title} — Vellora` : "Legal — Vellora" };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const doc = DOCS[slug];
  if (!doc) notFound();

  return (
    <article className="mx-auto w-full max-w-3xl px-6 pt-20 pb-24 sm:pt-28">
      <Reveal>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {doc.title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: June 2026 · Placeholder</p>
        <div className="mt-8 space-y-5 leading-relaxed text-pretty text-muted-foreground">
          <p>
            This is placeholder legal content for the Vellora portfolio showcase. It does not
            constitute a real {doc.title.toLowerCase()} and should be replaced with reviewed legal
            copy before any production use.
          </p>
          <p>
            Vellora is designed with privacy and security in mind: data is isolated per tenant with
            row-level security, sensitive documents are stored privately, and access is governed by
            role-based permissions.
          </p>
          <p>For any questions about this document, please contact us through the contact page.</p>
        </div>
      </Reveal>
    </article>
  );
}
