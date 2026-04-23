"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { FamilyProfile, Settings } from "../model/schema";
import { familyProfileSchema, settingsSchema } from "../model/schema";
import { defaultUsdToIls, rateAsOf, rateSource } from "../currency/convert";

const defaultProfile: FamilyProfile = {
  version: 1,
  family: {
    kidAAge: 9,
    kidBAge: 6,
    kidBHasIEP: true,
    kidBHasMedicaidWaiver: false,
    observance: "traditional",
    keepsKosher: true,
  },
  lifestyle: {
    city: "denver_co",
    parentA: {
      employed: true,
      jobType: "local_newspaper",
      grossSalaryUsd: 55000,
      hasEmployerHealth: false,
      employerPremiumYearlyUsd: 0,
    },
    parentB: {
      mode: "ssdi",
      grossSalaryUsd: 0,
      ssdiMonthlyUsd: 1580,
      ssiMonthlyUsd: 0,
    },
    housing: {
      bedrooms: 3,
      monthlyRentUsd: 2750,
      overrideRent: false,
    },
    transport: {
      hasCar: true,
      usesTransit: false,
    },
    schools: {
      kidASchool: "denver_jds",
      kidAGrantPct: 0.55,
      kidBPlacement: "publicIEP",
      kidBTuitionYearlyUsd: 0,
      kidBTherapyMonthlyUsd: 400,
    },
    health: {
      strategy: "marketplace",
      usage: "typical",
    },
  },
};

const defaultSettings: Settings = {
  locale: "he",
  currency: "ILS",
  fx: {
    usdToIls: defaultUsdToIls,
    mode: "manual",
    asOf: rateAsOf,
    source: rateSource,
  },
  assumptions: {
    taxYear: 2025,
    acaExtended: true,
    kosherMultiplierOverride: null,
    reserveMonthsForGreen: 2,
  },
};

interface SimState {
  profile: FamilyProfile;
  settings: Settings;
  setProfile: (p: FamilyProfile) => void;
  patchFamily: (p: Partial<FamilyProfile["family"]>) => void;
  patchLifestyle: (p: Partial<FamilyProfile["lifestyle"]>) => void;
  patchParentA: (p: Partial<FamilyProfile["lifestyle"]["parentA"]>) => void;
  patchParentB: (p: Partial<FamilyProfile["lifestyle"]["parentB"]>) => void;
  patchHousing: (p: Partial<FamilyProfile["lifestyle"]["housing"]>) => void;
  patchTransport: (p: Partial<FamilyProfile["lifestyle"]["transport"]>) => void;
  patchSchools: (p: Partial<FamilyProfile["lifestyle"]["schools"]>) => void;
  patchHealth: (p: Partial<FamilyProfile["lifestyle"]["health"]>) => void;
  patchSettings: (p: Partial<Settings>) => void;
  patchAssumptions: (p: Partial<Settings["assumptions"]>) => void;
  setCurrency: (c: Settings["currency"]) => void;
  setFxRate: (rate: number, mode: Settings["fx"]["mode"], source?: string, asOf?: string) => void;
  reset: () => void;
  importJson: (raw: unknown) => { ok: boolean; error?: string };
  exportJson: () => string;
}

export const useSimStore = create<SimState>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      settings: defaultSettings,
      setProfile: (p) => set({ profile: p }),
      patchFamily: (p) =>
        set((s) => ({ profile: { ...s.profile, family: { ...s.profile.family, ...p } } })),
      patchLifestyle: (p) =>
        set((s) => ({ profile: { ...s.profile, lifestyle: { ...s.profile.lifestyle, ...p } } })),
      patchParentA: (p) =>
        set((s) => ({
          profile: {
            ...s.profile,
            lifestyle: { ...s.profile.lifestyle, parentA: { ...s.profile.lifestyle.parentA, ...p } },
          },
        })),
      patchParentB: (p) =>
        set((s) => ({
          profile: {
            ...s.profile,
            lifestyle: { ...s.profile.lifestyle, parentB: { ...s.profile.lifestyle.parentB, ...p } },
          },
        })),
      patchHousing: (p) =>
        set((s) => ({
          profile: {
            ...s.profile,
            lifestyle: { ...s.profile.lifestyle, housing: { ...s.profile.lifestyle.housing, ...p } },
          },
        })),
      patchTransport: (p) =>
        set((s) => ({
          profile: {
            ...s.profile,
            lifestyle: {
              ...s.profile.lifestyle,
              transport: { ...s.profile.lifestyle.transport, ...p },
            },
          },
        })),
      patchSchools: (p) =>
        set((s) => ({
          profile: {
            ...s.profile,
            lifestyle: { ...s.profile.lifestyle, schools: { ...s.profile.lifestyle.schools, ...p } },
          },
        })),
      patchHealth: (p) =>
        set((s) => ({
          profile: {
            ...s.profile,
            lifestyle: { ...s.profile.lifestyle, health: { ...s.profile.lifestyle.health, ...p } },
          },
        })),
      patchSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),
      patchAssumptions: (p) =>
        set((s) => ({
          settings: { ...s.settings, assumptions: { ...s.settings.assumptions, ...p } },
        })),
      setCurrency: (c) => set((s) => ({ settings: { ...s.settings, currency: c } })),
      setFxRate: (rate, mode, source, asOf) =>
        set((s) => ({
          settings: {
            ...s.settings,
            fx: {
              usdToIls: rate,
              mode,
              source: source ?? s.settings.fx.source,
              asOf: asOf ?? new Date().toISOString().slice(0, 10),
            },
          },
        })),
      reset: () => set({ profile: defaultProfile, settings: defaultSettings }),
      importJson: (raw) => {
        const parsed = familyProfileSchema.safeParse(raw);
        if (!parsed.success) return { ok: false, error: parsed.error.message };
        set({ profile: parsed.data });
        return { ok: true };
      },
      exportJson: () => JSON.stringify(get().profile, null, 2),
    }),
    {
      name: "col-sim-v1",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : undefined as never)),
      partialize: (s) => ({ profile: s.profile, settings: s.settings }),
      merge: (persisted, current) => {
        const p = persisted as Partial<SimState> | undefined;
        const merged = { ...current, ...(p ?? {}) };
        const profileOk = familyProfileSchema.safeParse(merged.profile);
        const settingsOk = settingsSchema.safeParse(merged.settings);
        return {
          ...merged,
          profile: profileOk.success ? profileOk.data : current.profile,
          settings: settingsOk.success ? settingsOk.data : current.settings,
        };
      },
    }
  )
);
