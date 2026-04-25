import { z } from "zod";

export const citySlugSchema = z.string().min(2);

export const taxBracketSchema = z.object({
  upTo: z.number().nullable(),
  rate: z.number(),
});

export const jurisdictionConstantsSchema = z.object({
  jurisdiction: z.string(),
  year: z.number(),
  standardDeductionMFJ: z.number().optional(),
  brackets: z.array(taxBracketSchema).optional(),
  flatRate: z.number().optional(),
  stateEitcMultiplier: z.number().optional(),
  localPerEmployeeMonthly: z.number().optional(),
  notes: z.string().optional(),
});

export const federalConstantsSchema = z.object({
  year: z.number(),
  fpl: z.record(z.string(), z.number()),
  fplIncrementPerPerson: z.number(),
  standardDeductionMFJ: z.number(),
  brackets: z.array(taxBracketSchema),
  fica: z.object({
    employeeRate: z.number(),
    socialSecurityWageBase: z.number(),
  }),
  ctc: z.object({
    perChild: z.number(),
    refundableCap: z.number(),
    phaseoutStartMFJ: z.number(),
  }),
  eitc: z.object({
    maxMFJ2Kids: z.number(),
    phaseoutEnd: z.number(),
  }),
  aca: z.object({
    applicablePctBands: z.array(z.object({ pctFplMax: z.number().nullable(), pct: z.number() })),
  }),
  snap: z.object({
    maxAllotmentFamily4: z.number(),
    standardDeductionMonthly4Plus: z.number(),
    shelterDeductionCapMonthly: z.number(),
    grossIncomePctFpl: z.number(),
    benefitReductionRate: z.number(),
  }),
  ssdi: z.object({
    sgaMonthlyNonBlind: z.number(),
    averageMonthlyBenefit: z.number(),
  }),
  ssi: z.object({
    federalMaxSingle: z.number(),
    federalMaxCouple: z.number(),
  }),
});

export const cityDataSchema = z.object({
  slug: citySlugSchema,
  labelKey: z.string(),
  state: z.string(),
  jurisdictions: z.array(z.string()),
  housing: z.object({
    medianRentByBedrooms: z.record(z.string(), z.number()),
    hudFmrByBedrooms: z.record(z.string(), z.number()),
    jewishNeighborhoodPremium: z.number(),
  }),
  utilitiesYearly: z.object({
    electric: z.number(),
    gasHeat: z.number(),
    waterSewer: z.number(),
    internet: z.number(),
  }),
  transport: z.object({
    carInsuranceYearly: z.number(),
    gasMonthly: z.number(),
    transitPassMonthly: z.number(),
  }),
  food: z.object({
    usdaModerateMonthlyFamily4: z.number(),
    kosherMultiplier: z.number(),
  }),
  acaBenchmarkFamily4Monthly: z.number(),
  chip: z.object({
    kidsPctFplCap: z.number(),
  }),
  schools: z.array(z.string()),
});
export type CityData = z.infer<typeof cityDataSchema>;

export const schoolDataSchema = z.object({
  slug: z.string(),
  labelKey: z.string(),
  city: z.string(),
  stickerByGrade: z.record(z.string(), z.number()),
  feesExtraYearly: z.number(),
  aftercareMonthly: z.number(),
  typicalGrantBands: z.array(
    z.object({
      magiMax: z.number().nullable(),
      grantPctMin: z.number(),
      grantPctMax: z.number(),
    })
  ),
});
export type SchoolData = z.infer<typeof schoolDataSchema>;

// ----- Schema v2: dynamic children + custom expenses -----

export const childPlacementSchema = z.enum([
  "public",
  "publicIEP",
  "publicSpecial",
  "privateDistrictFunded",
  "privateSelfPay",
  "jewishDay",
  "jewishDayWithSupport",
]);
export type ChildPlacement = z.infer<typeof childPlacementSchema>;

export const childSchema = z.object({
  id: z.string(),
  label: z.string().default(""),
  age: z.number().min(0).max(22).default(7),
  hasIEP: z.boolean().default(false),
  hasMedicaidWaiver: z.boolean().default(false),
  placement: childPlacementSchema.default("public"),
  jewishSchoolSlug: z.string().default(""),
  grantPct: z.number().min(0).max(1).default(0),
  tuitionOverrideYearly: z.number().min(0).default(0),
  therapyMonthly: z.number().min(0).default(0),
});
export type Child = z.infer<typeof childSchema>;

export const expenseCategorySchema = z.enum([
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
]);
export type ExpenseCategory = z.infer<typeof expenseCategorySchema>;

export const customExpenseSchema = z.object({
  id: z.string(),
  label: z.string(),
  category: expenseCategorySchema,
  amountUsd: z.number().min(0),
  frequency: z.enum(["monthly", "yearly", "oneTime"]),
  enabled: z.boolean().default(true),
  notes: z.string().default(""),
});
export type CustomExpense = z.infer<typeof customExpenseSchema>;

export const defaultCustomExpenses: CustomExpense[] = [
  { id: "exp_phone", label: "Phone (family plan)", category: "phone", amountUsd: 65, frequency: "monthly", enabled: true, notes: "" },
  { id: "exp_internet", label: "Internet", category: "internet", amountUsd: 60, frequency: "monthly", enabled: true, notes: "" },
  { id: "exp_clothing", label: "Clothing", category: "clothing", amountUsd: 1500, frequency: "yearly", enabled: true, notes: "" },
  { id: "exp_activities", label: "Kids' activities", category: "activities", amountUsd: 120, frequency: "monthly", enabled: true, notes: "" },
  { id: "exp_synagogue", label: "Synagogue dues", category: "synagogue", amountUsd: 1500, frequency: "yearly", enabled: true, notes: "" },
  { id: "exp_streaming", label: "Streaming services", category: "subscriptions", amountUsd: 35, frequency: "monthly", enabled: true, notes: "" },
];

export const familyProfileSchema = z.object({
  version: z.literal(2),
  scenarioName: z.string().default("My family"),
  family: z.object({
    children: z.array(childSchema).max(8).default([]),
    foodMultiplier: z.number().min(0.5).max(3.0).default(1.3),
  }),
  lifestyle: z.object({
    city: z.string(),
    parentA: z.object({
      employed: z.boolean(),
      jobType: z.enum([
        "local_newspaper",
        "nonprofit_communications",
        "community_org",
        "freelance_journalism",
      ]),
      grossSalaryUsd: z.number().min(0),
      hasEmployerHealth: z.boolean(),
      employerPremiumYearlyUsd: z.number().min(0),
    }),
    parentB: z.object({
      mode: z.enum(["employed", "ssdi", "ssi", "none"]),
      grossSalaryUsd: z.number().min(0),
      ssdiMonthlyUsd: z.number().min(0),
      ssiMonthlyUsd: z.number().min(0),
    }),
    housing: z.object({
      bedrooms: z.number().min(1).max(5),
      monthlyRentUsd: z.number().min(0),
      overrideRent: z.boolean(),
      tier: z.enum(["budget", "standard", "premium"]).default("standard"),
    }),
    transport: z.object({
      hasCar: z.boolean(),
      usesTransit: z.boolean(),
      carType: z
        .enum([
          "used_compact",
          "used_sedan",
          "used_minivan",
          "new_compact",
          "new_sedan",
          "new_minivan",
        ])
        .default("used_sedan"),
    }),
    health: z.object({
      strategy: z.enum(["employerFamily", "marketplace", "medicaid", "mixed"]),
      usage: z.enum(["low", "typical", "high"]),
    }),
    customExpenses: z.array(customExpenseSchema).default([]),
  }),
});
export type FamilyProfile = z.infer<typeof familyProfileSchema>;

export const settingsSchema = z.object({
  locale: z.enum(["he", "en"]),
  currency: z.enum(["USD", "ILS"]),
  fx: z.object({
    usdToIls: z.number().positive(),
    mode: z.enum(["manual", "auto"]),
    asOf: z.string(),
    source: z.string(),
  }),
  assumptions: z.object({
    taxYear: z.number(),
    acaExtended: z.boolean(),
    kosherMultiplierOverride: z.number().nullable(),
    reserveMonthsForGreen: z.number().min(0).max(12),
  }),
});
export type Settings = z.infer<typeof settingsSchema>;

// ----- Migration from v1 to v2 -----

interface V1Profile {
  version: 1;
  family: {
    kidAAge: number;
    kidBAge: number;
    kidBHasIEP: boolean;
    kidBHasMedicaidWaiver: boolean;
    foodMultiplier: number;
  };
  lifestyle: {
    city: string;
    parentA: FamilyProfile["lifestyle"]["parentA"];
    parentB: FamilyProfile["lifestyle"]["parentB"];
    housing: FamilyProfile["lifestyle"]["housing"];
    transport: FamilyProfile["lifestyle"]["transport"];
    schools: {
      kidASchool: string;
      kidAGrantPct: number;
      kidBPlacement:
        | "publicIEP"
        | "publicSpecial"
        | "privateDistrictFunded"
        | "privateSelfPay"
        | "jewishDayWithSupport";
      kidBTuitionYearlyUsd: number;
      kidBTherapyMonthlyUsd: number;
    };
    health: FamilyProfile["lifestyle"]["health"];
  };
}

export function migrateProfile(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const obj = raw as { version?: number };
  if (obj.version === 2) return raw;
  if (obj.version === 1) {
    const v1 = raw as V1Profile;
    const childA: Child = {
      id: "kid_a",
      label: "Kid A",
      age: v1.family.kidAAge,
      hasIEP: false,
      hasMedicaidWaiver: false,
      placement: "jewishDay",
      jewishSchoolSlug: v1.lifestyle.schools.kidASchool,
      grantPct: v1.lifestyle.schools.kidAGrantPct,
      tuitionOverrideYearly: 0,
      therapyMonthly: 0,
    };
    const childB: Child = {
      id: "kid_b",
      label: "Kid B",
      age: v1.family.kidBAge,
      hasIEP: v1.family.kidBHasIEP,
      hasMedicaidWaiver: v1.family.kidBHasMedicaidWaiver,
      placement: v1.lifestyle.schools.kidBPlacement,
      jewishSchoolSlug:
        v1.lifestyle.schools.kidBPlacement === "jewishDayWithSupport"
          ? v1.lifestyle.schools.kidASchool
          : "",
      grantPct: 0,
      tuitionOverrideYearly: v1.lifestyle.schools.kidBTuitionYearlyUsd,
      therapyMonthly: v1.lifestyle.schools.kidBTherapyMonthlyUsd,
    };
    return {
      version: 2,
      scenarioName: "My family",
      family: {
        children: [childA, childB],
        foodMultiplier: v1.family.foodMultiplier,
      },
      lifestyle: {
        city: v1.lifestyle.city,
        parentA: v1.lifestyle.parentA,
        parentB: v1.lifestyle.parentB,
        housing: v1.lifestyle.housing,
        transport: v1.lifestyle.transport,
        health: v1.lifestyle.health,
        customExpenses: defaultCustomExpenses,
      },
    };
  }
  return raw;
}
