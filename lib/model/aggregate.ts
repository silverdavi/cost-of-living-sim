import { getCity, getSchool } from "../data/loaders";
import { computeIncome, computeMagi, type IncomeBreakdown } from "./income";
import { computeTaxes, type TaxBreakdown } from "./taxes";
import { computeAca, expectedOopMedicalYearly, type AcaResult } from "./aca";
import { computeSnap, type SnapResult } from "./snap";
import { computeChildCost, type ChildCost } from "./schools";
import {
  computeHousing,
  computeFoodYearly,
  computeTransport,
  computeCustomExpenses,
  type HousingCost,
  type TransportCost,
  type CustomExpensesBreakdown,
} from "./expenses";
import { federal } from "../data/loaders";
import type { FamilyProfile, SchoolData } from "./schema";

export interface Assumptions {
  acaExtended: boolean;
  kosherMultiplierOverride: number | null;
  reserveMonthsForGreen: number;
}

export type Feasibility = "green" | "yellow" | "red";

export interface Aggregate {
  income: IncomeBreakdown;
  magi: number;
  taxes: TaxBreakdown;
  housing: HousingCost;
  foodYearly: number;
  transport: TransportCost;
  customExpenses: CustomExpensesBreakdown;
  children: ChildCost[];
  childrenTotal: number;
  aca: AcaResult;
  oopMedicalYearly: number;
  snap: SnapResult;
  totalExpensesYearly: number;
  totalAssistanceYearly: number;
  netCashYearly: number;
  monthlyCashflow: number;
  effectiveMarginalRate: number;
  feasibility: Feasibility;
  householdSize: number;
}

function safeGetSchool(slug: string): SchoolData | null {
  if (!slug) return null;
  try {
    return getSchool(slug);
  } catch {
    return null;
  }
}

export function runSimulation(profile: FamilyProfile, assumptions: Assumptions): Aggregate {
  const city = getCity(profile.lifestyle.city);
  const numKids = profile.family.children.length;
  const household = 2 + numKids;

  const income = computeIncome(profile, federal.ssdi.sgaMonthlyNonBlind);
  const magi = computeMagi(income);

  const numEarningAdults =
    (profile.lifestyle.parentA.employed ? 1 : 0) +
    (profile.lifestyle.parentB.mode === "employed" ||
    (profile.lifestyle.parentB.mode === "ssdi" && profile.lifestyle.parentB.grossSalaryUsd > 0) ||
    (profile.lifestyle.parentB.mode === "ssi" && profile.lifestyle.parentB.grossSalaryUsd > 0)
      ? 1
      : 0);

  const taxes = computeTaxes({
    magi,
    earnedIncome: income.earnedTotal,
    stateSlug: city.state,
    numKids,
    numEarningAdults,
    householdSize: household,
  });

  const housing = computeHousing(city, profile);
  const foodYearly = computeFoodYearly(city, profile.family.foodMultiplier, household);
  const transport = computeTransport(city, {
    hasCar: profile.lifestyle.transport.hasCar,
    usesTransit: profile.lifestyle.transport.usesTransit,
    carType: profile.lifestyle.transport.carType,
  });
  const customExpenses = computeCustomExpenses(profile.lifestyle.customExpenses ?? []);

  const children: ChildCost[] = profile.family.children.map((child) => {
    const school = safeGetSchool(child.jewishSchoolSlug);
    return computeChildCost(child, school);
  });
  const childrenTotal = children.reduce((sum, c) => sum + c.total, 0);

  const aca = computeAca({
    magi,
    householdSize: household,
    benchmarkYearly: city.acaBenchmarkFamily4Monthly * 12,
    chipKidsPctFplCap: city.chip.kidsPctFplCap,
    acaExtended: assumptions.acaExtended,
    strategy: profile.lifestyle.health.strategy,
    employerPremiumYearly: profile.lifestyle.parentA.employerPremiumYearlyUsd,
  });
  const oopMedicalYearly = expectedOopMedicalYearly(
    profile.lifestyle.health.usage,
    aca.onMedicaid,
    profile.lifestyle.health.strategy
  );

  const hasDisabled = profile.lifestyle.parentB.mode === "ssdi" || profile.lifestyle.parentB.mode === "ssi";
  const snap = computeSnap({
    grossYearly: income.grossYearly,
    earnedYearly: income.earnedTotal,
    rentYearly: housing.rentYearly,
    utilitiesYearly: housing.utilitiesYearly,
    householdSize: household,
    hasDisabledMember: hasDisabled,
  });

  const totalExpensesYearly =
    taxes.totalTax +
    housing.total +
    foodYearly +
    transport.total +
    customExpenses.totalYearly +
    childrenTotal +
    aca.netPremiumYearly +
    oopMedicalYearly;

  const totalAssistanceYearly =
    snap.yearlyBenefit + taxes.refundableCredits + taxes.stateEitc;

  const netCashYearly = income.grossYearly - totalExpensesYearly + totalAssistanceYearly;
  const monthlyCashflow = netCashYearly / 12;

  const monthlyExpenses = totalExpensesYearly / 12;
  const reserveNeeded = monthlyExpenses * assumptions.reserveMonthsForGreen;
  let feasibility: Feasibility;
  if (netCashYearly < 0) feasibility = "red";
  else if (netCashYearly < reserveNeeded) feasibility = "yellow";
  else feasibility = "green";

  const effectiveMarginalRate = computeMarginalRate(profile, assumptions);

  return {
    income,
    magi,
    taxes,
    housing,
    foodYearly,
    transport,
    customExpenses,
    children,
    childrenTotal,
    aca,
    oopMedicalYearly,
    snap,
    totalExpensesYearly,
    totalAssistanceYearly,
    netCashYearly,
    monthlyCashflow,
    effectiveMarginalRate,
    feasibility,
    householdSize: household,
  };
}

function computeMarginalRate(profile: FamilyProfile, assumptions: Assumptions): number {
  const base = runSimulationCore(profile, assumptions);
  const bumped: FamilyProfile = {
    ...profile,
    lifestyle: {
      ...profile.lifestyle,
      parentA: {
        ...profile.lifestyle.parentA,
        grossSalaryUsd: profile.lifestyle.parentA.grossSalaryUsd + 1000,
      },
    },
  };
  const bumpedResult = runSimulationCore(bumped, assumptions);
  const delta = base - bumpedResult;
  return Math.max(-1, Math.min(2, delta / 1000));
}

function runSimulationCore(profile: FamilyProfile, assumptions: Assumptions): number {
  const city = getCity(profile.lifestyle.city);
  const numKids = profile.family.children.length;
  const household = 2 + numKids;
  const income = computeIncome(profile, federal.ssdi.sgaMonthlyNonBlind);
  const magi = computeMagi(income);
  const numEarningAdults = (profile.lifestyle.parentA.employed ? 1 : 0) +
    (profile.lifestyle.parentB.mode === "employed" ? 1 : 0);
  const taxes = computeTaxes({
    magi,
    earnedIncome: income.earnedTotal,
    stateSlug: city.state,
    numKids,
    numEarningAdults,
    householdSize: household,
  });
  const aca = computeAca({
    magi,
    householdSize: household,
    benchmarkYearly: city.acaBenchmarkFamily4Monthly * 12,
    chipKidsPctFplCap: city.chip.kidsPctFplCap,
    acaExtended: assumptions.acaExtended,
    strategy: profile.lifestyle.health.strategy,
    employerPremiumYearly: profile.lifestyle.parentA.employerPremiumYearlyUsd,
  });
  const snap = computeSnap({
    grossYearly: income.grossYearly,
    earnedYearly: income.earnedTotal,
    rentYearly: (profile.lifestyle.housing.monthlyRentUsd || 2400) * 12,
    utilitiesYearly: 3500,
    householdSize: household,
    hasDisabledMember: profile.lifestyle.parentB.mode === "ssdi" || profile.lifestyle.parentB.mode === "ssi",
  });
  return income.grossYearly - taxes.totalTax - aca.netPremiumYearly + taxes.refundableCredits + taxes.stateEitc + snap.yearlyBenefit;
}

export function buildCliff(profile: FamilyProfile, assumptions: Assumptions, steps = 25): Array<{ earned: number; net: number }> {
  const out: Array<{ earned: number; net: number }> = [];
  const max = 150000;
  for (let i = 0; i <= steps; i++) {
    const earned = (max * i) / steps;
    const p: FamilyProfile = {
      ...profile,
      lifestyle: {
        ...profile.lifestyle,
        parentA: { ...profile.lifestyle.parentA, grossSalaryUsd: earned, employed: earned > 0 },
      },
    };
    out.push({ earned, net: runSimulationCore(p, assumptions) });
  }
  return out;
}
