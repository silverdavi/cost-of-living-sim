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
import citiesIndex from "../../data/cities/_index.json";
import allCitiesJson from "../../data/cities/all.json";
import schoolsJson from "../../data/schools/jewish_day_schools.json";
import defaultProfile from "../../data/family_profiles/default.json";

export const federal = federal2025;
export const stateConstants: Record<string, unknown> = {
  colorado: colorado2025,
  rhode_island: rhodeIsland2025,
};

const cityMap: Record<string, unknown> = Object.fromEntries(
  allCitiesJson.cities.map((city) => [city.slug, city])
);

function buildGenericSchool(citySlug: string): SchoolData {
  return schoolDataSchema.parse({
    slug: `generic_jds__${citySlug}`,
    labelKey: "schools.generic_jds",
    city: citySlug,
    stickerByGrade: {
      K: 18000,
      "1": 19000,
      "2": 20000,
      "3": 21000,
      "4": 22000,
      "5": 23000,
      "6": 24000,
    },
    feesExtraYearly: 1200,
    aftercareMonthly: 300,
    typicalGrantBands: [
      { magiMax: 60000, grantPctMin: 0.55, grantPctMax: 0.75 },
      { magiMax: 90000, grantPctMin: 0.35, grantPctMax: 0.55 },
      { magiMax: 130000, grantPctMin: 0.15, grantPctMax: 0.35 },
      { magiMax: 180000, grantPctMin: 0, grantPctMax: 0.15 },
      { magiMax: null, grantPctMin: 0, grantPctMax: 0 },
    ],
  });
}

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
  if (slug.startsWith("generic_jds__")) {
    return buildGenericSchool(slug.replace("generic_jds__", ""));
  }
  const found = schoolsJson.schools.find((s) => s.slug === slug);
  if (!found) throw new Error(`Unknown school: ${slug}`);
  return schoolDataSchema.parse(found);
}

export function getSchoolsForCity(citySlug: string): SchoolData[] {
  const schools = schoolsJson.schools
    .filter((s) => s.city === citySlug)
    .map((s) => schoolDataSchema.parse(s));
  return schools.length > 0 ? schools : [buildGenericSchool(citySlug)];
}

export function getDefaultProfile(): FamilyProfile {
  return familyProfileSchema.parse(defaultProfile);
}
