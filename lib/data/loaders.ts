import {
  cityDataSchema,
  schoolDataSchema,
  familyProfileSchema,
  type CityData,
  type SchoolData,
  type FamilyProfile,
} from "../model/schema";

import federal2025 from "../../data/constants/federal_2025.json";
import colorado2025 from "../../data/constants/colorado_2025.json";
import rhodeIsland2025 from "../../data/constants/rhode_island_2025.json";
import denver from "../../data/cities/denver_co.json";
import providence from "../../data/cities/providence_ri.json";
import citiesIndex from "../../data/cities/_index.json";
import schoolsJson from "../../data/schools/jewish_day_schools.json";
import defaultProfile from "../../data/family_profiles/default.json";

export const federal = federal2025;
export const stateConstants: Record<string, unknown> = {
  colorado: colorado2025,
  rhode_island: rhodeIsland2025,
};

const cityMap: Record<string, unknown> = {
  denver_co: denver,
  providence_ri: providence,
};

export function listCitySlugs(): string[] {
  return citiesIndex.cities;
}

export function getCity(slug: string): CityData {
  const raw = cityMap[slug];
  if (!raw) throw new Error(`Unknown city: ${slug}`);
  return cityDataSchema.parse(raw);
}

export function getAllCities(): CityData[] {
  return listCitySlugs().map(getCity);
}

export function getSchool(slug: string): SchoolData {
  const found = schoolsJson.schools.find((s) => s.slug === slug);
  if (!found) throw new Error(`Unknown school: ${slug}`);
  return schoolDataSchema.parse(found);
}

export function getSchoolsForCity(citySlug: string): SchoolData[] {
  return schoolsJson.schools
    .filter((s) => s.city === citySlug)
    .map((s) => schoolDataSchema.parse(s));
}

export function getDefaultProfile(): FamilyProfile {
  return familyProfileSchema.parse(defaultProfile);
}
