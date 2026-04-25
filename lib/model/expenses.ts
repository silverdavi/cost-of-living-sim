import type { CityData, FamilyProfile, CustomExpense, ExpenseCategory } from "./schema";

export interface HousingCost {
  monthlyRent: number;
  rentYearly: number;
  utilitiesYearly: number;
  rentersInsuranceYearly: number;
  tier: "budget" | "standard" | "premium";
  tierMultiplier: number;
  medianRent: number;
  total: number;
}

export const HOUSING_TIER_MULTIPLIER: Record<"budget" | "standard" | "premium", number> = {
  budget: 0.85,
  standard: 1.0,
  premium: 1.2,
};

export function computeHousing(city: CityData, profile: FamilyProfile): HousingCost {
  const { housing } = profile.lifestyle;
  const br = String(housing.bedrooms);
  const median = city.housing.medianRentByBedrooms[br] ?? city.housing.medianRentByBedrooms["3"];
  const tier = housing.tier ?? "standard";
  const tierMultiplier = HOUSING_TIER_MULTIPLIER[tier];
  const baseline = Math.round(median * tierMultiplier * (1 + city.housing.jewishNeighborhoodPremium));
  const rent = housing.overrideRent ? housing.monthlyRentUsd : baseline;
  const utilitiesYearly =
    city.utilitiesYearly.electric +
    city.utilitiesYearly.gasHeat +
    city.utilitiesYearly.waterSewer +
    city.utilitiesYearly.internet;
  const rentersInsuranceYearly = 200;
  return {
    monthlyRent: rent,
    rentYearly: rent * 12,
    utilitiesYearly,
    rentersInsuranceYearly,
    tier,
    tierMultiplier,
    medianRent: median,
    total: rent * 12 + utilitiesYearly + rentersInsuranceYearly,
  };
}

export function computeFoodYearly(
  city: CityData,
  foodMultiplier: number,
  householdSize: number = 4
): number {
  const baseFamily4 = city.food.usdaModerateMonthlyFamily4 * 12;
  // USDA plan is per family of 4; scale roughly per person for other sizes.
  const sizeMultiplier = householdSize / 4;
  return Math.round(baseFamily4 * foodMultiplier * sizeMultiplier);
}

export type CarType =
  | "used_compact"
  | "used_sedan"
  | "used_minivan"
  | "new_compact"
  | "new_sedan"
  | "new_minivan";

export interface CarProfile {
  insuranceMult: number;
  gasMult: number;
  maintenanceMult: number;
  monthlyPayment: number;
}

export const CAR_PROFILES: Record<CarType, CarProfile> = {
  used_compact:  { insuranceMult: 0.80, gasMult: 0.80, maintenanceMult: 1.10, monthlyPayment: 0   },
  used_sedan:    { insuranceMult: 1.00, gasMult: 1.00, maintenanceMult: 1.00, monthlyPayment: 0   },
  used_minivan:  { insuranceMult: 1.15, gasMult: 1.20, maintenanceMult: 1.20, monthlyPayment: 0   },
  new_compact:   { insuranceMult: 1.00, gasMult: 0.80, maintenanceMult: 0.70, monthlyPayment: 400 },
  new_sedan:     { insuranceMult: 1.10, gasMult: 1.00, maintenanceMult: 0.70, monthlyPayment: 500 },
  new_minivan:   { insuranceMult: 1.25, gasMult: 1.20, maintenanceMult: 0.80, monthlyPayment: 650 },
};

export const CAR_MAINTENANCE_YEARLY = 800;

export interface TransportCost {
  carYearly: number;
  transitYearly: number;
  carInsuranceYearly: number;
  gasYearly: number;
  maintenanceYearly: number;
  paymentYearly: number;
  carType: CarType;
  total: number;
}

export function computeTransport(
  city: CityData,
  opts: { hasCar: boolean; usesTransit: boolean; carType?: CarType }
): TransportCost {
  const carType = opts.carType ?? "used_sedan";
  const prof = CAR_PROFILES[carType];
  const carInsuranceYearly = opts.hasCar
    ? Math.round(city.transport.carInsuranceYearly * prof.insuranceMult)
    : 0;
  const gasYearly = opts.hasCar
    ? Math.round(city.transport.gasMonthly * 12 * prof.gasMult)
    : 0;
  const maintenanceYearly = opts.hasCar
    ? Math.round(CAR_MAINTENANCE_YEARLY * prof.maintenanceMult)
    : 0;
  const paymentYearly = opts.hasCar ? prof.monthlyPayment * 12 : 0;
  const carYearly = carInsuranceYearly + gasYearly + maintenanceYearly + paymentYearly;
  const transitYearly = opts.usesTransit ? city.transport.transitPassMonthly * 12 : 0;
  return {
    carYearly,
    transitYearly,
    carInsuranceYearly,
    gasYearly,
    maintenanceYearly,
    paymentYearly,
    carType,
    total: carYearly + transitYearly,
  };
}

export interface CustomExpensesBreakdown {
  totalYearly: number;
  byCategory: Record<ExpenseCategory, number>;
  enabledItems: Array<CustomExpense & { yearly: number }>;
}

const ALL_CATEGORIES: ExpenseCategory[] = [
  "phone",
  "internet",
  "clothing",
  "synagogue",
  "activities",
  "subscriptions",
  "debt",
  "childcare",
  "pets",
  "gifts",
  "travel",
  "savings",
  "other",
];

export function expenseYearly(e: CustomExpense): number {
  if (!e.enabled) return 0;
  if (e.frequency === "monthly") return e.amountUsd * 12;
  return e.amountUsd;
}

export function computeCustomExpenses(items: CustomExpense[]): CustomExpensesBreakdown {
  const byCategory = ALL_CATEGORIES.reduce((acc, c) => {
    acc[c] = 0;
    return acc;
  }, {} as Record<ExpenseCategory, number>);
  const enabledItems: Array<CustomExpense & { yearly: number }> = [];
  let totalYearly = 0;
  for (const item of items) {
    const y = expenseYearly(item);
    if (item.enabled) enabledItems.push({ ...item, yearly: y });
    byCategory[item.category] += y;
    totalYearly += y;
  }
  return { totalYearly, byCategory, enabledItems };
}

export const DEFAULT_CUSTOM_EXPENSES: Omit<CustomExpense, "id">[] = [
  { label: "Phone (family plan)",     category: "phone",         amountUsd: 65,   frequency: "monthly", enabled: true, notes: "" },
  { label: "Internet",                category: "internet",      amountUsd: 60,   frequency: "monthly", enabled: true, notes: "" },
  { label: "Clothing",                category: "clothing",      amountUsd: 1500, frequency: "yearly",  enabled: true, notes: "" },
  { label: "Kids' activities",        category: "activities",    amountUsd: 120,  frequency: "monthly", enabled: true, notes: "" },
  { label: "Synagogue dues",          category: "synagogue",     amountUsd: 1500, frequency: "yearly",  enabled: true, notes: "" },
  { label: "Streaming services",      category: "subscriptions", amountUsd: 35,   frequency: "monthly", enabled: true, notes: "" },
];
