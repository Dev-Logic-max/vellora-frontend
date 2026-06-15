import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/marketing/reveal";
import { FinalCta } from "@/components/marketing/final-cta";
import { POSTS, formatDate, getPost } from "@/components/marketing/blog/posts";

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Article — Vellora" };
  return { title: `${post.title} — Vellora`, description: post.excerpt };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <article className="mx-auto w-full max-w-3xl px-6 pt-20 pb-16 sm:pt-28">
        <Reveal>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to blog
          </Link>

          <div className="mt-6">
            <span className="text-sm font-semibold text-primary">{post.category}</span>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
              {post.title}
            </h1>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <span>{post.author}</span>
              <span>·</span>
              <span>{formatDate(post.date)}</span>
              <span>·</span>
              <span>{post.readingTime}</span>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-8 aspect-[16/8] overflow-hidden rounded-2xl bg-[linear-gradient(135deg,var(--primary),color-mix(in_oklch,var(--primary)_30%,var(--background)))] ring-1 ring-foreground/10" />

        <Reveal className="mt-8">
          <p className="text-lg leading-relaxed text-pretty text-foreground">{post.excerpt}</p>
          <div className="mt-6 space-y-5 leading-relaxed text-pretty text-muted-foreground">
            {post.body.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </Reveal>
      </article>

      <FinalCta />
    </>
  );
}
