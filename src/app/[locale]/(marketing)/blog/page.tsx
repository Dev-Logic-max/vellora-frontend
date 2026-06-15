import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";

import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Reveal, RevealGroup, RevealItem } from "@/components/marketing/reveal";
import { PageHeader } from "@/components/marketing/page-header";
import { POSTS, formatDate } from "@/components/marketing/blog/posts";

export const metadata: Metadata = {
  title: "Blog — Vellora",
  description: "Product updates, operations playbooks, and notes from building Vellora.",
};

export default async function BlogPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [featured, ...rest] = POSTS;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-20 pb-20 sm:pt-28">
      <PageHeader
        eyebrow="Blog"
        title="Ideas for running better stores"
        subtitle="Operations playbooks, product notes, and lessons from building modern workforce software."
      />

      {/* Featured */}
      <Reveal className="mt-14">
        <Link
          href={`/blog/${featured.slug}`}
          className="group grid overflow-hidden rounded-2xl border border-border ring-1 ring-foreground/5 lg:grid-cols-2"
        >
          <div className="aspect-[16/10] bg-[linear-gradient(135deg,var(--primary),color-mix(in_oklch,var(--primary)_30%,var(--background)))] lg:aspect-auto" />
          <div className="flex flex-col justify-center p-8">
            <span className="text-xs font-semibold text-primary">{featured.category}</span>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-balance text-foreground">
              {featured.title}
            </h2>
            <p className="mt-3 text-sm text-pretty text-muted-foreground">{featured.excerpt}</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{featured.author}</span>
              <span>·</span>
              <span>{formatDate(featured.date)}</span>
              <span>·</span>
              <span>{featured.readingTime}</span>
            </div>
            <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Read article
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      </Reveal>

      {/* Grid */}
      <RevealGroup className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <RevealItem key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="hover-lift group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card ring-1 ring-foreground/5"
            >
              <div className="aspect-[16/9] bg-[linear-gradient(135deg,var(--muted),var(--background))]" />
              <div className="flex flex-1 flex-col p-5">
                <span className="text-xs font-semibold text-primary">{post.category}</span>
                <h3 className="mt-2 font-display text-base font-semibold tracking-tight text-balance text-foreground">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDate(post.date)}</span>
                  <span>·</span>
                  <span>{post.readingTime}</span>
                </div>
              </div>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
