"use client";

import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";
import { Wordmark } from "@/components/marketing/wordmark";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import {
  COMPANY_LINKS,
  FEATURE_LINKS,
  RESOURCE_LINKS,
  type NavLink,
} from "@/components/marketing/nav/nav-data";

type Section = {
  id: "features" | "resources" | "company";
  group: "features_links" | "resources_links" | "company_links";
  links: NavLink[];
};

const SECTIONS: Section[] = [
  { id: "features", group: "features_links", links: FEATURE_LINKS },
  { id: "resources", group: "resources_links", links: RESOURCE_LINKS },
  { id: "company", group: "company_links", links: COMPANY_LINKS },
];

type LinkCopy = Record<string, { title: string; description: string }>;

export function MobileMenu() {
  const t = useTranslations("Nav");

  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="outline" size="icon-lg" aria-label={t("openMenu")} />}
        className="md:hidden"
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>
            <Wordmark />
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <Accordion className="w-full">
            {SECTIONS.map((section) => {
              const copy = t.raw(section.group) as LinkCopy;
              return (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger className="text-base">{t(section.id)}</AccordionTrigger>
                  <AccordionContent>
                    <ul className="grid gap-0.5 pl-1">
                      {section.links.map((link) => (
                        <li key={link.key}>
                          <SheetClose
                            render={<Link href={link.href} />}
                            className="block rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            {copy[link.key].title}
                          </SheetClose>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          <SheetClose
            render={<Link href="/pricing" />}
            className="mt-1 block rounded-lg py-2.5 text-base font-medium text-foreground transition-colors hover:text-primary"
          >
            {t("pricing")}
          </SheetClose>

          <div className="mt-4">
            <LanguageSwitcher />
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2 border-t border-border p-4">
          <SheetClose
            render={<Link href="/login" />}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
          >
            {t("signIn")}
          </SheetClose>
          <SheetClose
            render={<Link href="/signup" />}
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            {t("getStarted")}
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
