import type { CityData, FamilyProfile } from "./schema";

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

export function computeFoodYearly(city: CityData, keepsKosher: boolean, kosherMultiplierOverride: number | null): number {
  const base = city.food.usdaModerateMonthlyFamily4 * 12;
  if (!keepsKosher) return base;
  const mult = kosherMultiplierOverride ?? city.food.kosherMultiplier;
  return Math.round(base * mult);
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

export function computeOtherYearly(): number {
  const phone = 65 * 12;
  const clothing = 1500;
  const kidsActivities = 120 * 12;
  const synagogue = 1500;
  const streaming = 35 * 12;
  return phone + clothing + kidsActivities + synagogue + streaming;
}
