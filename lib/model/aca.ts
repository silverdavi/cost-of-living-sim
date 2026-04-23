import { federal } from "../data/loaders";

export interface AcaResult {
  applicablePct: number;
  expectedContributionYearly: number;
  premiumTaxCreditYearly: number;
  netPremiumYearly: number;
  onMedicaid: boolean;
  kidsOnChip: boolean;
  magiPctFpl: number;
}

export function householdFpl(householdSize: number): number {
  const table = federal.fpl as Record<string, number>;
  const key = String(Math.min(8, Math.max(1, householdSize)));
  const base = table[key];
  if (householdSize <= 8) return base;
  return base + (householdSize - 8) * federal.fplIncrementPerPerson;
}

function pickApplicablePct(
  pctFpl: number,
  bands: { pctFplMax: number | null; pct: number }[],
  acaExtended: boolean
): number {
  if (!acaExtended) {
    if (pctFpl > 4.0) return 1.0;
  }
  for (const b of bands) {
    if (b.pctFplMax === null) return b.pct;
    if (pctFpl <= b.pctFplMax) return b.pct;
  }
  return 0.085;
}

export function computeAca(opts: {
  magi: number;
  householdSize: number;
  benchmarkYearly: number;
  chipKidsPctFplCap: number;
  acaExtended: boolean;
  strategy: string;
  employerPremiumYearly: number;
}): AcaResult {
  const fpl = householdFpl(opts.householdSize);
  const magiPctFpl = opts.magi / fpl;
  const onMedicaid = magiPctFpl <= 1.38;
  const kidsOnChip = magiPctFpl <= opts.chipKidsPctFplCap;

  if (opts.strategy === "medicaid" || onMedicaid) {
    return {
      applicablePct: 0,
      expectedContributionYearly: 0,
      premiumTaxCreditYearly: 0,
      netPremiumYearly: 0,
      onMedicaid: true,
      kidsOnChip: true,
      magiPctFpl,
    };
  }

  if (opts.strategy === "employerFamily") {
    return {
      applicablePct: 0,
      expectedContributionYearly: 0,
      premiumTaxCreditYearly: 0,
      netPremiumYearly: opts.employerPremiumYearly,
      onMedicaid: false,
      kidsOnChip,
      magiPctFpl,
    };
  }

  const applicablePct = pickApplicablePct(
    magiPctFpl,
    federal.aca.applicablePctBands,
    opts.acaExtended
  );
  const expected = opts.magi * applicablePct;
  const ptc = Math.max(0, opts.benchmarkYearly - expected);
  const net = Math.max(0, opts.benchmarkYearly - ptc);
  return {
    applicablePct,
    expectedContributionYearly: expected,
    premiumTaxCreditYearly: ptc,
    netPremiumYearly: net,
    onMedicaid: false,
    kidsOnChip,
    magiPctFpl,
  };
}

export function expectedOopMedicalYearly(
  usage: "low" | "typical" | "high",
  onMedicaid: boolean,
  strategy: string
): number {
  if (onMedicaid || strategy === "medicaid") return 100;
  switch (usage) {
    case "low": return 1200;
    case "typical": return 3500;
    case "high": return 8000;
  }
}
