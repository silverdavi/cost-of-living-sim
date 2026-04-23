"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useSimStore } from "@/lib/store/useSimStore";
import { runSimulation } from "@/lib/model/aggregate";
import { Money } from "@/components/controls/Money";
import { cn } from "@/lib/utils";

export function LiveBottomLine() {
  const t = useTranslations();
  const locale = useLocale();
  const profile = useSimStore((s) => s.profile);
  const assumptions = useSimStore((s) => s.settings.assumptions);

  const agg = useMemo(
    () => runSimulation(profile, assumptions),
    [profile, assumptions]
  );

  const dot = {
    green: "bg-ok",
    yellow: "bg-warn",
    red: "bg-bad",
  }[agg.feasibility];
  const ring = {
    green: "ring-ok/30",
    yellow: "ring-warn/30",
    red: "ring-bad/30",
  }[agg.feasibility];

  const ArrowIcon = locale === "he" ? ArrowLeft : ArrowRight;

  const numberBlock = (label: string, usd: number, tone: "strong" | "soft" = "soft") => (
    <div className="flex flex-col leading-tight">
      <span className="text-[10px] uppercase tracking-wide text-muted">{label}</span>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={usd}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22 }}
          className={cn(
            "tabular-nums",
            tone === "strong"
              ? "text-lg font-semibold text-ink"
              : "text-sm font-medium text-ink/80"
          )}
        >
          <Money usd={usd} />
        </motion.span>
      </AnimatePresence>
    </div>
  );

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-line/60 bg-white/70 px-3 py-1.5 shadow-soft ring-1",
        ring
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn("inline-block h-2.5 w-2.5 rounded-full", dot)} />
        <span className="text-xs font-medium text-ink/80">
          {t("results.liveLine.title")}
        </span>
      </div>

      <div className="hidden sm:block h-6 w-px bg-line/60" />

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
        {numberBlock(t("results.liveLine.netYear"), agg.netCashYearly, "strong")}
        {numberBlock(t("results.liveLine.perMonth"), agg.monthlyCashflow)}
        {numberBlock(t("results.liveLine.expenses"), agg.totalExpensesYearly)}
        {numberBlock(t("results.liveLine.assistance"), agg.totalAssistanceYearly)}
      </div>

      <div className="ms-auto">
        <Link
          href={`/${locale}/results`}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-accent-deep hover:bg-accent/10 transition-colors"
        >
          {t("results.liveLine.seeDetails")}
          <ArrowIcon className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
