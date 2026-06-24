"use client";

import { useMemo } from "react";

import { Flag } from "@/components/ui/flag";
import { RichSelect, type RichOption } from "@/components/ui/rich-select";
import { COUNTRIES } from "@/lib/geo/countries";
import { CURRENCIES } from "@/lib/geo/currencies";
import { banksForCountry, bankLogoUrl, type BankDef } from "@/lib/geo/banks";

interface BaseProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/** Country dropdown — flag + name; value is the ISO alpha-2 code. */
export function CountrySelect({ ...rest }: BaseProps) {
  const options = useMemo<RichOption[]>(
    () =>
      COUNTRIES.map((c) => ({
        value: c.code,
        title: c.name,
        leading: <Flag code={c.code} className="h-4 w-6" />,
        trailing: <span className="text-xs text-muted-foreground">{c.code}</span>,
        searchText: `${c.name} ${c.code}`,
      })),
    [],
  );
  return <RichSelect options={options} placeholder="Select country" {...rest} />;
}

/**
 * Currency dropdown — symbol + name on the left, flag-ish code on the right.
 * Value is the ISO-4217 code. (Per spec: symbol/name left, code right.)
 */
export function CurrencySelect({ ...rest }: BaseProps) {
  const options = useMemo<RichOption[]>(
    () =>
      CURRENCIES.map((c) => ({
        value: c.code,
        title: `${c.symbol}  ${c.name}`,
        leading: (
          <span className="inline-flex size-7 items-center justify-center rounded-md bg-accent-soft text-sm font-semibold text-accent-strong">
            {c.symbol}
          </span>
        ),
        trailing: <span className="text-xs font-medium text-muted-foreground">{c.code}</span>,
        searchText: `${c.code} ${c.name} ${c.symbol}`,
      })),
    [],
  );
  return <RichSelect options={options} placeholder="Select currency" {...rest} />;
}

/** Brand-color initials badge for a bank (logo fallback). */
export function BankBadge({ bank, className }: { bank: BankDef; className?: string }) {
  const initials = bank.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className={className ?? "relative inline-flex size-8 shrink-0 overflow-hidden rounded-lg"}
      style={{ backgroundColor: `${bank.brandColor}1a`, color: bank.brandColor }}
    >
      {/* Real logo when present in public/banks; falls back to initials.
          Plain <img> is intentional: it must hide itself via onError when the
          file is absent (next/image can't), and logos are tiny static assets. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={bankLogoUrl(bank.logoKey)}
        alt=""
        className="absolute inset-0 size-full object-contain p-1"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
      <span className="flex size-full items-center justify-center text-[11px] font-bold">
        {initials}
      </span>
    </span>
  );
}

/** Bank dropdown filtered by the selected country; value is the bank name. */
export function BankSelect({
  country,
  ...rest
}: BaseProps & { country: string | undefined }) {
  const options = useMemo<RichOption[]>(() => {
    return banksForCountry(country).map((b) => ({
      value: b.name,
      title: b.name,
      subtitle: b.swift ?? b.officialName,
      leading: <BankBadge bank={b} />,
      searchText: `${b.name} ${b.officialName ?? ""} ${b.swift ?? ""}`,
    }));
  }, [country]);

  return (
    <RichSelect
      options={options}
      placeholder={country ? "Select bank" : "Select country first"}
      emptyText={country ? "No banks listed for this country yet" : "Pick a country first"}
      {...rest}
    />
  );
}
