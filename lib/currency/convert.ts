import ratesJson from "../../data/fx/rates.json";

export type Currency = "USD" | "ILS";

export const defaultUsdToIls: number = ratesJson.default_usd_to_ils;
export const rateAsOf: string = ratesJson.as_of;
export const rateSource: string = ratesJson.source;

export function convertFromUsd(amountUsd: number, currency: Currency, usdToIls: number): number {
  if (currency === "USD") return amountUsd;
  return amountUsd * usdToIls;
}

export function formatMoney(
  amountUsd: number,
  opts: { currency: Currency; usdToIls: number; locale: string; fractionDigits?: number }
): string {
  const value = convertFromUsd(amountUsd, opts.currency, opts.usdToIls);
  const fractionDigits = opts.fractionDigits ?? 0;
  try {
    return new Intl.NumberFormat(opts.locale, {
      style: "currency",
      currency: opts.currency,
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits,
    }).format(value);
  } catch {
    const sign = opts.currency === "USD" ? "$" : "₪";
    return `${sign}${Math.round(value).toLocaleString(opts.locale)}`;
  }
}
