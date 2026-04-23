"use client";

import { useLocale } from "next-intl";
import { useSimStore } from "@/lib/store/useSimStore";
import { formatMoney } from "@/lib/currency/convert";

export function Money({
  usd,
  className,
  fractionDigits = 0,
}: {
  usd: number;
  className?: string;
  fractionDigits?: number;
}) {
  const locale = useLocale();
  const currency = useSimStore((s) => s.settings.currency);
  const rate = useSimStore((s) => s.settings.fx.usdToIls);
  return <span className={className}>{formatMoney(usd, { currency, usdToIls: rate, locale, fractionDigits })}</span>;
}
