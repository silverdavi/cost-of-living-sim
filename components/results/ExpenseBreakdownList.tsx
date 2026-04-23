"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useSimStore } from "@/lib/store/useSimStore";
import { formatMoney } from "@/lib/currency/convert";
import type { Aggregate } from "@/lib/model/aggregate";
import { cn } from "@/lib/utils";

type RowKey =
  | "housing"
  | "taxes"
  | "health"
  | "schools"
  | "food"
  | "transport"
  | "other"
  | "assistance";

function useMoneyFmt() {
  const locale = useLocale();
  const currency = useSimStore((s) => s.settings.currency);
  const rate = useSimStore((s) => s.settings.fx.usdToIls);
  return (usd: number) => formatMoney(usd, { currency, usdToIls: rate, locale });
}

export function ExpenseBreakdownList({ agg }: { agg: Aggregate }) {
  const t = useTranslations();
  const money = useMoneyFmt();
  const [open, setOpen] = useState<RowKey | null>(null);

  const profile = useSimStore((s) => s.profile);
  const strategy = profile.lifestyle.health.strategy;

  const rows = useMemo(() => {
    const snapTotal = agg.snap.yearlyBenefit;
    const creditsRefundable = agg.taxes.refundableCredits;
    const list: Array<{ key: RowKey; label: string; amount: number; lines: (string | null)[]; desc: string }> = [
      {
        key: "housing",
        label: t("results.breakdown.housing"),
        amount: agg.housing.total,
        desc: t("results.explain.housingDesc"),
        lines: [
          t("results.explain.housingFormula", {
            rent: money(agg.housing.monthlyRent),
            tier: t(`lifestyle.housing.tiers.${agg.housing.tier}`),
            tierMult: agg.housing.tierMultiplier.toFixed(2),
            median: money(agg.housing.medianRent),
            utilities: money(agg.housing.utilitiesYearly),
            insurance: money(agg.housing.rentersInsuranceYearly),
            total: money(agg.housing.total),
          }),
        ],
      },
      {
        key: "taxes",
        label: t("results.breakdown.taxes"),
        amount: agg.taxes.totalTax,
        desc: t("results.explain.taxesDesc"),
        lines: [
          t("results.explain.taxesFormula", {
            federal: money(agg.taxes.federalIncomeTax),
            fica: money(agg.taxes.fica),
            state: money(agg.taxes.stateIncomeTax),
            local: money(agg.taxes.localTax),
          }),
          t("results.explain.taxesCreditsNote", {
            ctc: money(agg.taxes.ctc),
            eitc: money(agg.taxes.eitc),
            stateEitc: money(agg.taxes.stateEitc),
          }),
        ],
      },
      {
        key: "health",
        label: t("results.breakdown.health"),
        amount: agg.aca.netPremiumYearly + agg.oopMedicalYearly,
        desc: t("results.explain.healthDesc"),
        lines: [
          agg.aca.onMedicaid || strategy === "medicaid"
            ? t("results.explain.healthFormulaMedicaid", { oop: money(agg.oopMedicalYearly) })
            : strategy === "employerFamily"
              ? t("results.explain.healthFormulaEmployer", {
                  premium: money(agg.aca.netPremiumYearly),
                  oop: money(agg.oopMedicalYearly),
                  total: money(agg.aca.netPremiumYearly + agg.oopMedicalYearly),
                })
              : t("results.explain.healthFormulaAca", {
                  benchmark: money(
                    agg.aca.netPremiumYearly + agg.aca.premiumTaxCreditYearly
                  ),
                  ptc: money(agg.aca.premiumTaxCreditYearly),
                  oop: money(agg.oopMedicalYearly),
                  total: money(agg.aca.netPremiumYearly + agg.oopMedicalYearly),
                }),
        ],
      },
      {
        key: "schools",
        label: t("results.breakdown.schools"),
        amount: agg.kidA.total + agg.kidB.total,
        desc: t("results.explain.schoolsDesc"),
        lines: [
          t("results.explain.kidALine", {
            sticker: money(agg.kidA.sticker),
            grantPct: Math.round(agg.kidA.grantPct * 100),
            fees: money(agg.kidA.fees),
            aftercare: money(agg.kidA.aftercareYearly),
            total: money(agg.kidA.total),
          }),
          t("results.explain.kidBLine", {
            tuition: money(agg.kidB.tuition),
            therapy: money(agg.kidB.therapy / 12),
            total: money(agg.kidB.total),
          }),
        ],
      },
      {
        key: "food",
        label: t("results.breakdown.food"),
        amount: agg.foodYearly,
        desc: t("results.explain.foodDesc"),
        lines: [
          (() => {
            const monthly = Math.round(agg.foodYearly / 12 / (profile.family.keepsKosher ? 1.3 : 1));
            return t("results.explain.foodFormula", {
              monthly: money(monthly),
              kosher: profile.family.keepsKosher
                ? t("results.explain.foodKosher", { mult: "1.30" })
                : "",
              total: money(agg.foodYearly),
            });
          })(),
        ],
      },
      {
        key: "transport",
        label: t("results.breakdown.transport"),
        amount: agg.transport.total,
        desc: t("results.explain.transportDesc"),
        lines: [
          profile.lifestyle.transport.hasCar
            ? t("results.explain.transportCar", {
                insurance: money(agg.transport.carInsuranceYearly),
                gas: money(agg.transport.gasYearly),
                maintenance: money(agg.transport.maintenanceYearly),
                payment:
                  agg.transport.paymentYearly > 0
                    ? t("results.explain.transportPayment", {
                        payment: money(agg.transport.paymentYearly),
                      })
                    : "",
                car: money(agg.transport.carYearly),
              })
            : t("results.explain.transportNoCar"),
          profile.lifestyle.transport.usesTransit
            ? t("results.explain.transportTransit", {
                transit: money(agg.transport.transitYearly),
              })
            : null,
        ],
      },
      {
        key: "other",
        label: t("results.breakdown.other"),
        amount: agg.otherYearly,
        desc: t("results.explain.otherDesc"),
        lines: [
          t("results.explain.otherFormula", { total: money(agg.otherYearly) }),
        ],
      },
      {
        key: "assistance",
        label: t("results.breakdown.assistance"),
        amount: -(snapTotal + creditsRefundable + agg.taxes.stateEitc),
        desc: t("results.explain.assistanceDesc"),
        lines: [
          t("results.explain.assistanceFormula", {
            snap: snapTotal > 0 ? money(snapTotal) : money(0),
            credits: money(creditsRefundable),
            stateEitc: money(agg.taxes.stateEitc),
            total: money(snapTotal + creditsRefundable + agg.taxes.stateEitc),
          }),
          snapTotal === 0 ? t("results.explain.snapIneligible") : null,
        ],
      },
    ];
    return list;
  }, [agg, money, profile, strategy, t]);

  return (
    <div className="card-strong">
      <header className="mb-3">
        <h3 className="text-base font-semibold">{t("results.explain.heading")}</h3>
        <p className="hint">{t("results.explain.subtitle")}</p>
      </header>
      <ul className="divide-y divide-line/60">
        {rows.map((r) => {
          const isOpen = open === r.key;
          const isAssistance = r.key === "assistance";
          return (
            <li key={r.key}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : r.key)}
                className="flex w-full items-center justify-between gap-3 py-3 text-start transition-colors hover:bg-surface/60 rounded-lg px-2"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-2">
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                  <span className="font-medium">{r.label}</span>
                </div>
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    isAssistance ? "text-ok" : "text-ink"
                  )}
                >
                  {isAssistance ? "+" : ""}
                  {money(Math.abs(r.amount))}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 pt-1 space-y-2">
                      <p className="hint">{r.desc}</p>
                      <div className="space-y-1 rounded-xl bg-surface/60 p-3 text-sm font-mono leading-relaxed text-ink/90 border border-line/40">
                        {r.lines.filter(Boolean).map((l, i) => (
                          <div key={i}>{l}</div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function MasterEquation({ agg }: { agg: Aggregate }) {
  const t = useTranslations();
  const money = useMoneyFmt();
  const assistance = agg.totalAssistanceYearly;
  const expensesExTax = agg.totalExpensesYearly - agg.taxes.totalTax;

  const Cell = ({
    label,
    value,
    tone,
  }: {
    label: string;
    value: number;
    tone: "gross" | "assist" | "tax" | "exp" | "net";
  }) => (
    <div
      className={cn(
        "flex flex-col rounded-2xl border px-4 py-3 min-w-[120px]",
        tone === "gross" && "border-line bg-white/60",
        tone === "assist" && "border-ok/50 bg-ok/10",
        tone === "tax" && "border-bad/50 bg-bad/10",
        tone === "exp" && "border-warn/60 bg-warn/10",
        tone === "net" && "border-accent-deep bg-accent/10"
      )}
    >
      <span className="text-[11px] uppercase tracking-wide text-muted">{label}</span>
      <span className="text-base font-semibold tabular-nums text-ink">{money(value)}</span>
    </div>
  );

  const op = (sym: string) => (
    <span className="text-xl font-light text-muted px-1">{sym}</span>
  );

  return (
    <div className="card-strong">
      <header className="mb-3">
        <h3 className="text-base font-semibold">{t("results.master.title")}</h3>
        <p className="hint">{t("results.master.formula")}</p>
      </header>
      <div className="flex flex-wrap items-center gap-2">
        <Cell label={t("results.master.gross")} value={agg.income.grossYearly} tone="gross" />
        {op("+")}
        <Cell label={t("results.master.assistance")} value={assistance} tone="assist" />
        {op("−")}
        <Cell label={t("results.master.taxes")} value={agg.taxes.totalTax} tone="tax" />
        {op("−")}
        <Cell label={t("results.master.expenses")} value={expensesExTax} tone="exp" />
        {op("=")}
        <Cell label={t("results.master.net")} value={agg.netCashYearly} tone="net" />
      </div>
    </div>
  );
}
