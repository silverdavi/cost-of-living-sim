import type { FamilyProfile } from "./schema";

export interface IncomeBreakdown {
  parentAEarned: number;
  parentBEarned: number;
  earnedTotal: number;
  ssdiYearly: number;
  ssiYearly: number;
  unearnedTotal: number;
  grossYearly: number;
  sgaViolated: boolean;
  ssdiSuspended: boolean;
}

export function computeIncome(
  profile: FamilyProfile,
  sgaMonthlyNonBlind: number
): IncomeBreakdown {
  const { parentA, parentB } = profile.lifestyle;
  const parentAEarned = parentA.employed ? parentA.grossSalaryUsd : 0;

  let parentBEarned = 0;
  let ssdiYearly = 0;
  let ssiYearly = 0;

  switch (parentB.mode) {
    case "employed":
      parentBEarned = parentB.grossSalaryUsd;
      break;
    case "ssdi":
      ssdiYearly = parentB.ssdiMonthlyUsd * 12;
      parentBEarned = parentB.grossSalaryUsd;
      break;
    case "ssi":
      ssiYearly = parentB.ssiMonthlyUsd * 12;
      parentBEarned = parentB.grossSalaryUsd;
      break;
    case "none":
      break;
  }

  const earnedTotal = parentAEarned + parentBEarned;
  const sgaViolated = parentB.mode === "ssdi" && parentBEarned / 12 > sgaMonthlyNonBlind;
  const ssdiSuspended = sgaViolated;
  if (ssdiSuspended) ssdiYearly = 0;

  const unearnedTotal = ssdiYearly + ssiYearly;
  return {
    parentAEarned,
    parentBEarned,
    earnedTotal,
    ssdiYearly,
    ssiYearly,
    unearnedTotal,
    grossYearly: earnedTotal + unearnedTotal,
    sgaViolated,
    ssdiSuspended,
  };
}

export function computeMagi(income: IncomeBreakdown): number {
  const earned = income.earnedTotal;
  let taxableSsdi = 0;
  const prelim = earned + income.ssdiYearly / 2;
  if (prelim > 32000) {
    taxableSsdi = Math.min(income.ssdiYearly * 0.85, (prelim - 32000) * 0.5);
  }
  return earned + taxableSsdi;
}
