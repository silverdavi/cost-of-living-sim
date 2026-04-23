import { federal, stateConstants } from "../data/loaders";

interface Bracket {
  upTo: number | null;
  rate: number;
}

export function applyBrackets(taxableIncome: number, brackets: Bracket[]): number {
  if (taxableIncome <= 0) return 0;
  let remaining = taxableIncome;
  let last = 0;
  let tax = 0;
  for (const b of brackets) {
    const ceiling = b.upTo ?? Number.POSITIVE_INFINITY;
    const span = Math.max(0, Math.min(ceiling, taxableIncome) - last);
    if (span <= 0) {
      if (ceiling === Number.POSITIVE_INFINITY) break;
      last = ceiling;
      continue;
    }
    tax += span * b.rate;
    remaining -= span;
    last = ceiling;
    if (remaining <= 0) break;
  }
  return tax;
}

export interface TaxBreakdown {
  federalIncomeTax: number;
  fica: number;
  stateIncomeTax: number;
  localTax: number;
  ctc: number;
  eitc: number;
  stateEitc: number;
  totalTax: number;
  refundableCredits: number;
}

export function estimateFederalEitc(magi: number, numKids: number): number {
  if (numKids < 2) return 0;
  const { maxMFJ2Kids, phaseoutEnd } = federal.eitc;
  const start = 30000;
  if (magi <= start) return maxMFJ2Kids;
  if (magi >= phaseoutEnd) return 0;
  const t = (phaseoutEnd - magi) / (phaseoutEnd - start);
  return Math.max(0, Math.round(maxMFJ2Kids * t));
}

export function computeTaxes(opts: {
  magi: number;
  earnedIncome: number;
  stateSlug: string;
  numKids: number;
  numEarningAdults: number;
  householdSize: number;
}): TaxBreakdown {
  const { magi, earnedIncome, stateSlug, numKids, numEarningAdults, householdSize } = opts;

  const federalTaxable = Math.max(0, magi - federal.standardDeductionMFJ);
  const federalPreCredits = applyBrackets(federalTaxable, federal.brackets);
  const ctcTotal = federal.ctc.perChild * numKids;
  const ctc = Math.min(ctcTotal, federalPreCredits);
  const ctcRefundable = Math.min(
    federal.ctc.refundableCap * numKids,
    Math.max(0, ctcTotal - ctc)
  );
  const eitc = estimateFederalEitc(magi, numKids);
  const federalIncomeTax = Math.max(0, federalPreCredits - ctc);
  const refundableCredits = ctcRefundable + eitc;

  const fica = federal.fica.employeeRate * earnedIncome;

  let stateIncomeTax = 0;
  let localTax = 0;
  let stateEitc = 0;

  if (stateSlug === "colorado") {
    const c = stateConstants.colorado as {
      flatRate: number;
      standardDeductionMFJ: number;
      stateEitcMultiplier: number;
      localPerEmployeeMonthly: number;
    };
    const stateTaxable = Math.max(0, magi - c.standardDeductionMFJ);
    stateIncomeTax = stateTaxable * c.flatRate;
    stateEitc = Math.round(eitc * c.stateEitcMultiplier);
    localTax = c.localPerEmployeeMonthly * 12 * numEarningAdults;
  } else if (stateSlug === "rhode_island") {
    const c = stateConstants.rhode_island as {
      brackets: Bracket[];
      standardDeductionMFJ: number;
      personalExemptionPerPerson: number;
      stateEitcMultiplier: number;
    };
    const stateTaxable = Math.max(
      0,
      magi - c.standardDeductionMFJ - c.personalExemptionPerPerson * householdSize
    );
    stateIncomeTax = applyBrackets(stateTaxable, c.brackets);
    stateEitc = Math.round(eitc * c.stateEitcMultiplier);
  }

  const totalTax = federalIncomeTax + fica + stateIncomeTax + localTax;
  return {
    federalIncomeTax,
    fica,
    stateIncomeTax,
    localTax,
    ctc: ctcRefundable,
    eitc,
    stateEitc,
    totalTax,
    refundableCredits,
  };
}
