import type { CityData, FamilyProfile } from "./schema";

export interface HousingCost {
  monthlyRent: number;
  rentYearly: number;
  utilitiesYearly: number;
  rentersInsuranceYearly: number;
  total: number;
}

export function computeHousing(city: CityData, profile: FamilyProfile): HousingCost {
  const { housing } = profile.lifestyle;
  const br = String(housing.bedrooms);
  const median = city.housing.medianRentByBedrooms[br] ?? city.housing.medianRentByBedrooms["3"];
  const rent = housing.overrideRent ? housing.monthlyRentUsd : Math.round(median * (1 + city.housing.jewishNeighborhoodPremium));
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
    total: rent * 12 + utilitiesYearly + rentersInsuranceYearly,
  };
}

export function computeFoodYearly(city: CityData, keepsKosher: boolean, kosherMultiplierOverride: number | null): number {
  const base = city.food.usdaModerateMonthlyFamily4 * 12;
  if (!keepsKosher) return base;
  const mult = kosherMultiplierOverride ?? city.food.kosherMultiplier;
  return Math.round(base * mult);
}

export interface TransportCost {
  carYearly: number;
  transitYearly: number;
  carInsuranceYearly: number;
  gasYearly: number;
  maintenanceYearly: number;
  total: number;
}

export const CAR_MAINTENANCE_YEARLY = 800;

export function computeTransport(
  city: CityData,
  opts: { hasCar: boolean; usesTransit: boolean }
): TransportCost {
  const carInsuranceYearly = opts.hasCar ? city.transport.carInsuranceYearly : 0;
  const gasYearly = opts.hasCar ? city.transport.gasMonthly * 12 : 0;
  const maintenanceYearly = opts.hasCar ? CAR_MAINTENANCE_YEARLY : 0;
  const carYearly = carInsuranceYearly + gasYearly + maintenanceYearly;
  const transitYearly = opts.usesTransit ? city.transport.transitPassMonthly * 12 : 0;
  return {
    carYearly,
    transitYearly,
    carInsuranceYearly,
    gasYearly,
    maintenanceYearly,
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
