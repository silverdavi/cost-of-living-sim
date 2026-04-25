"use client";

import { useLocale, useTranslations } from "next-intl";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useSimStore } from "@/lib/store/useSimStore";
import { convertFromUsd, formatMoney } from "@/lib/currency/convert";
import type { Aggregate } from "@/lib/model/aggregate";

const COLORS = [
  "#E6A57E", // accent
  "#F4D58D", // accent2
  "#C67D55", // accent-deep
  "#A9C5A0", // ok
  "#E8B96F", // warn
  "#D99A9A", // bad
  "#7A6F62", // muted
];

export function YearlyBreakdown({ agg }: { agg: Aggregate }) {
  const t = useTranslations("results.breakdown");
  const locale = useLocale();
  const currency = useSimStore((s) => s.settings.currency);
  const rate = useSimStore((s) => s.settings.fx.usdToIls);

  const data = [
    { key: "taxes", usd: agg.taxes.totalTax, label: t("taxes") },
    { key: "housing", usd: agg.housing.total, label: t("housing") },
    { key: "schools", usd: agg.childrenTotal, label: t("schools") },
    { key: "health", usd: agg.aca.netPremiumYearly + agg.oopMedicalYearly, label: t("health") },
    { key: "food", usd: agg.foodYearly, label: t("food") },
    { key: "transport", usd: agg.transport.total, label: t("transport") },
    { key: "other", usd: agg.customExpenses.totalYearly, label: t("customExpenses") },
  ].map((d) => ({ ...d, display: convertFromUsd(d.usd, currency, rate) }));

  return (
    <div className="card-strong">
      <h3 className="text-base font-semibold mb-1">{t("title")}</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 12, right: 16, left: 8, bottom: 8 }}>
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#7A6F62" }} stroke="#E4D9C4" />
            <YAxis
              tick={{ fontSize: 11, fill: "#7A6F62" }}
              stroke="#E4D9C4"
              tickFormatter={(v) =>
                new Intl.NumberFormat(locale, {
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(v as number)
              }
            />
            <Tooltip
              contentStyle={{
                background: "rgba(255,255,255,0.95)",
                border: "1px solid #E4D9C4",
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(_value, _name, props) => {
                const usd = (props?.payload as { usd: number })?.usd ?? 0;
                return formatMoney(usd, { currency, usdToIls: rate, locale });
              }}
              labelStyle={{ fontWeight: 600, color: "#3A342E" }}
            />
            <Bar dataKey="display" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
