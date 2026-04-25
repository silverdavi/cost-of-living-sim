"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useSimStore } from "@/lib/store/useSimStore";
import { runSimulation } from "@/lib/model/aggregate";
import { Money } from "@/components/controls/Money";
import { Button } from "@/components/ui/button";

export function ReportView() {
  const t = useTranslations("report");
  const common = useTranslations();
  const profile = useSimStore((s) => s.profile);
  const assumptions = useSimStore((s) => s.settings.assumptions);
  const agg = useMemo(() => runSimulation(profile, assumptions), [profile, assumptions]);

  const rows = [
    [common("results.headline.grossIncome"), agg.income.grossYearly],
    [common("results.breakdown.taxes"), agg.taxes.totalTax],
    [common("results.breakdown.housing"), agg.housing.total],
    [common("results.breakdown.schools"), agg.childrenTotal],
    [common("results.breakdown.food"), agg.foodYearly],
    [common("results.breakdown.transport"), agg.transport.total],
    [common("results.breakdown.customExpenses"), agg.customExpenses.totalYearly],
    [common("results.breakdown.health"), agg.aca.netPremiumYearly + agg.oopMedicalYearly],
    [common("results.breakdown.assistance"), -agg.totalAssistanceYearly],
  ];

  return (
    <article className="report space-y-6">
      <div className="no-print flex justify-end">
        <Button onClick={() => window.print()}>{t("print")}</Button>
      </div>

      <section className="card-strong">
        <p className="text-sm text-muted">{t("scenario")}</p>
        <h1 className="text-3xl font-semibold">{profile.scenarioName}</h1>
        <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="card-strong">
          <p className="hint">{t("netYear")}</p>
          <p className="text-xl font-semibold"><Money usd={agg.netCashYearly} /></p>
        </div>
        <div className="card-strong">
          <p className="hint">{t("monthly")}</p>
          <p className="text-xl font-semibold"><Money usd={agg.monthlyCashflow} /></p>
        </div>
        <div className="card-strong">
          <p className="hint">{t("household")}</p>
          <p className="text-xl font-semibold">{agg.householdSize}</p>
        </div>
        <div className="card-strong">
          <p className="hint">{t("verdict")}</p>
          <p className="text-xl font-semibold">{agg.feasibility}</p>
        </div>
      </section>

      <section className="card-strong">
        <h2 className="mb-3 text-xl font-semibold">{t("yearlyTable")}</h2>
        <div className="divide-y divide-line/60">
          {rows.map(([label, value]) => (
            <div key={String(label)} className="flex justify-between gap-4 py-2">
              <span>{label}</span>
              <span className="font-semibold tabular-nums"><Money usd={Number(value)} /></span>
            </div>
          ))}
        </div>
      </section>

      <section className="card-strong">
        <h2 className="mb-3 text-xl font-semibold">{t("children")}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {agg.children.map((child) => (
            <div key={child.childId} className="rounded-xl border border-line/60 p-3">
              <div className="font-medium">{child.label}</div>
              <div className="text-sm text-muted">{child.placement}</div>
              <div className="mt-2 font-semibold"><Money usd={child.total} /></div>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
