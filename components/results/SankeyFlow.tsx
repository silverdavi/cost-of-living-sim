"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Money } from "@/components/controls/Money";
import type { Aggregate } from "@/lib/model/aggregate";

export function SankeyFlow({ agg }: { agg: Aggregate }) {
  const t = useTranslations("results.breakdown");

  const income = Math.max(1, agg.income.grossYearly + agg.totalAssistanceYearly);
  const outflows = [
    { key: "taxes", usd: agg.taxes.totalTax, color: "#D99A9A" },
    { key: "housing", usd: agg.housing.total, color: "#E6A57E" },
    { key: "schools", usd: agg.childrenTotal, color: "#C67D55" },
    { key: "health", usd: agg.aca.netPremiumYearly + agg.oopMedicalYearly, color: "#F4D58D" },
    { key: "food", usd: agg.foodYearly, color: "#A9C5A0" },
    { key: "transport", usd: agg.transport.total, color: "#E8B96F" },
    { key: "customExpenses", usd: agg.customExpenses.totalYearly, color: "#7A6F62" },
  ].filter((o) => o.usd > 0);

  const surplusKey = agg.netCashYearly >= 0 ? "surplus" : "deficit";
  const surplusUsd = Math.abs(agg.netCashYearly);

  return (
    <div className="card-strong">
      <h3 className="text-base font-semibold mb-3">{t("title")}</h3>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
        <div className="space-y-2">
          <div className="hint">{t("income")} + {t("assistance")}</div>
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl bg-accent/15 ring-1 ring-accent/30 p-4"
          >
            <div className="text-xl font-semibold">
              <Money usd={income} />
            </div>
            <div className="hint mt-1">
              {t("income")}: <Money usd={agg.income.grossYearly} /> ·{" "}
              {t("assistance")}: <Money usd={agg.totalAssistanceYearly} />
            </div>
          </motion.div>
        </div>

        <div className="flex items-center justify-center text-accent-deep">
          <svg width="40" height="24" viewBox="0 0 40 24" className="rtl:scale-x-[-1]">
            <path d="M2 12 L34 12 M28 6 L34 12 L28 18" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="space-y-2">
          {outflows.map((o) => {
            const pct = (o.usd / income) * 100;
            return (
              <motion.div
                key={o.key}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2 border border-line/60"
              >
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: o.color }} />
                <div className="flex-1 text-sm">{t(o.key)}</div>
                <motion.div
                  className="h-2 rounded-full"
                  style={{ background: o.color, width: `${Math.min(60, Math.max(6, pct))}%` }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="text-sm font-medium tabular-nums"><Money usd={o.usd} /></div>
              </motion.div>
            );
          })}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className={`mt-2 flex items-center gap-3 rounded-xl px-3 py-2 border ${surplusKey === "surplus" ? "bg-ok/15 border-ok/40" : "bg-bad/15 border-bad/40"}`}
          >
            <div className="flex-1 text-sm font-medium">{t(surplusKey)}</div>
            <div className="text-base font-semibold tabular-nums">
              {surplusKey === "deficit" && "−"}
              <Money usd={surplusUsd} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
