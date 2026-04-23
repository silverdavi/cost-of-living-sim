import { federal } from "../data/loaders";
import { householdFpl } from "./aca";

export interface SnapResult {
  eligibleGross: boolean;
  eligibleNet: boolean;
  monthlyBenefit: number;
  yearlyBenefit: number;
}

export function computeSnap(opts: {
  grossYearly: number;
  earnedYearly: number;
  rentYearly: number;
  utilitiesYearly: number;
  householdSize: number;
  hasDisabledMember: boolean;
}): SnapResult {
  const fplYearly = householdFpl(opts.householdSize);
  const grossMonthly = opts.grossYearly / 12;
  const earnedMonthly = opts.earnedYearly / 12;
  const fplMonthly = fplYearly / 12;
  const { maxAllotmentFamily4, standardDeductionMonthly4Plus, shelterDeductionCapMonthly, grossIncomePctFpl, benefitReductionRate } = federal.snap;

  const eligibleGross = opts.hasDisabledMember || grossMonthly <= grossIncomePctFpl * fplMonthly;

  const earnedDed = 0.20 * earnedMonthly;
  const adjusted = grossMonthly - earnedDed - standardDeductionMonthly4Plus;
  const shelterCost = (opts.rentYearly + opts.utilitiesYearly) / 12;
  const excessShelter = Math.max(0, shelterCost - 0.5 * adjusted);
  const shelterDed = opts.hasDisabledMember
    ? excessShelter
    : Math.min(excessShelter, shelterDeductionCapMonthly);
  const netMonthly = Math.max(0, adjusted - shelterDed);
  const eligibleNet = netMonthly <= fplMonthly;
  const allotment = maxAllotmentFamily4;
  const benefit = Math.max(0, allotment - benefitReductionRate * netMonthly);

  if (!eligibleGross || !eligibleNet) {
    return { eligibleGross, eligibleNet, monthlyBenefit: 0, yearlyBenefit: 0 };
  }
  return { eligibleGross, eligibleNet, monthlyBenefit: benefit, yearlyBenefit: benefit * 12 };
}
