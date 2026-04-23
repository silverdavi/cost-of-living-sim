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

export const familyProfileSchema = z.object({
  version: z.literal(1),
  family: z.object({
    kidAAge: z.number().min(5).max(10),
    kidBAge: z.number().min(5).max(10),
    kidBHasIEP: z.boolean(),
    kidBHasMedicaidWaiver: z.boolean(),
    observance: z.enum(["secular", "traditional", "shomerShabbat"]),
    keepsKosher: z.boolean(),
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
    }),
    transport: z.object({
      hasCar: z.boolean(),
      usesTransit: z.boolean(),
    }),
    schools: z.object({
      kidASchool: z.string(),
      kidAGrantPct: z.number().min(0).max(1),
      kidBPlacement: z.enum([
        "publicIEP",
        "publicSpecial",
        "privateDistrictFunded",
        "privateSelfPay",
        "jewishDayWithSupport",
      ]),
      kidBTuitionYearlyUsd: z.number().min(0),
      kidBTherapyMonthlyUsd: z.number().min(0),
    }),
    health: z.object({
      strategy: z.enum(["employerFamily", "marketplace", "medicaid", "mixed"]),
      usage: z.enum(["low", "typical", "high"]),
    }),
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
