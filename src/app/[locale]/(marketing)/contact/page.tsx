import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Clock, Mail, MapPin, MessageSquare, type LucideIcon } from "lucide-react";

import type { Locale } from "@/i18n/routing";
import { Reveal } from "@/components/marketing/reveal";
import { PageHeader } from "@/components/marketing/page-header";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Contact — Vellora",
  description: "Talk to our team about Vellora for your multi-store business.",
};

const DETAILS: { icon: LucideIcon; label: string; value: string }[] = [
  { icon: Mail, label: "Email", value: "hello@vellora.com" },
  { icon: MessageSquare, label: "Support", value: "support@vellora.com" },
  { icon: Clock, label: "Hours", value: "Mon–Fri, 9:00–18:00 (your timezone)" },
  { icon: MapPin, label: "Address", value: "Remote-first · serving teams worldwide" },
];

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section id="help" className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 pt-20 pb-20 sm:pt-28">
      <PageHeader
        eyebrow="Contact"
        title="Let's talk"
        subtitle="Questions about Vellora, a demo, or pricing for your stores? We'd love to hear from you."
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        {/* Details */}
        <Reveal className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Reach us directly, or send a message and we&apos;ll reply within one business day.
          </p>
          <ul className="space-y-5">
            {DETAILS.map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex items-start gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {label}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Form */}
        <Reveal>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
