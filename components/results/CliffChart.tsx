"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  CartesianGrid,
} from "recharts";
import { useSimStore } from "@/lib/store/useSimStore";
import { convertFromUsd, formatMoney } from "@/lib/currency/convert";
import { buildCliff } from "@/lib/model/aggregate";
import type { FamilyProfile } from "@/lib/model/schema";

export function CliffChart({ profile }: { profile: FamilyProfile }) {
  const t = useTranslations("results.cliff");
  const locale = useLocale();
  const currency = useSimStore((s) => s.settings.currency);
  const rate = useSimStore((s) => s.settings.fx.usdToIls);
  const assumptions = useSimStore((s) => s.settings.assumptions);

  const data = useMemo(
    () =>
      buildCliff(profile, assumptions, 30).map((p) => ({
        earnedUsd: p.earned,
        netUsd: p.net,
        earnedDisplay: convertFromUsd(p.earned, currency, rate),
        netDisplay: convertFromUsd(p.net, currency, rate),
      })),
    [profile, assumptions, currency, rate]
  );

  const markerEarned = profile.lifestyle.parentA.grossSalaryUsd;
  const markerNet = data.reduce((prev, curr) =>
    Math.abs(curr.earnedUsd - markerEarned) < Math.abs(prev.earnedUsd - markerEarned) ? curr : prev
  );

  return (
    <div className="card-strong">
      <h3 className="text-base font-semibold">{t("title")}</h3>
      <p className="hint mt-1 mb-3">{t("subtitle")}</p>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 12, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 6" stroke="#EDE4D1" />
            <XAxis
              dataKey="earnedDisplay"
              type="number"
              domain={["dataMin", "dataMax"]}
              tick={{ fontSize: 11, fill: "#7A6F62" }}
              stroke="#E4D9C4"
              tickFormatter={(v) =>
                new Intl.NumberFormat(locale, { notation: "compact" }).format(v as number)
              }
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#7A6F62" }}
              stroke="#E4D9C4"
              tickFormatter={(v) =>
                new Intl.NumberFormat(locale, { notation: "compact" }).format(v as number)
              }
            />
            <Tooltip
              contentStyle={{
                background: "rgba(255,255,255,0.95)",
                border: "1px solid #E4D9C4",
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(_v, _n, props) => {
                const d = props?.payload as { earnedUsd: number; netUsd: number };
                return [
                  formatMoney(d.netUsd, { currency, usdToIls: rate, locale }),
                  t("yAxis"),
                ];
              }}
              labelFormatter={(label, payload) => {
                const d = payload?.[0]?.payload as { earnedUsd: number } | undefined;
                if (!d) return String(label);
                return `${t("xAxis")}: ${formatMoney(d.earnedUsd, { currency, usdToIls: rate, locale })}`;
              }}
            />
            <Line
              type="monotone"
              dataKey="netDisplay"
              stroke="#C67D55"
              strokeWidth={2.2}
              dot={false}
              isAnimationActive={true}
            />
            <ReferenceDot
              x={convertFromUsd(markerEarned, currency, rate)}
              y={convertFromUsd(markerNet.netUsd, currency, rate)}
              r={6}
              fill="#E6A57E"
              stroke="#3A342E"
              strokeWidth={1.2}
              label={{ value: t("marker"), position: "top", fill: "#3A342E", fontSize: 11 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
