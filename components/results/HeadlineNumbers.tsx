"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Money } from "@/components/controls/Money";
import type { Aggregate } from "@/lib/model/aggregate";

export function HeadlineNumbers({ agg }: { agg: Aggregate }) {
  const t = useTranslations("results.headline");
  const items = [
    { key: "grossIncome", usd: agg.income.grossYearly, bold: false },
    { key: "netCash", usd: agg.netCashYearly, bold: true },
    { key: "monthly", usd: agg.monthlyCashflow, bold: false },
  ] as const;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <div key={item.key} className="card">
          <div className="hint">{t(item.key)}</div>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={item.usd}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className={`mt-1 ${item.bold ? "text-3xl font-semibold" : "text-xl"}`}
            >
              <Money usd={item.usd} />
            </motion.div>
          </AnimatePresence>
        </div>
      ))}
      <div className="card">
        <div className="hint">{t("effectiveTax")}</div>
        <div className="mt-1 text-xl">
          {(agg.effectiveMarginalRate * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
}
