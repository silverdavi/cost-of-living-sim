"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { FamilyProfile, Settings } from "../model/schema";
import { familyProfileSchema, migrateProfile, settingsSchema } from "../model/schema";
import { defaultUsdToIls, rateAsOf, rateSource } from "../currency/convert";

const defaultProfile: FamilyProfile = {
  version: 2,
  scenarioName: "D and N baseline",
  family: {
    children: [
      {
        id: "kid_a",
        label: "Kid A",
        age: 9,
        hasIEP: false,
        hasMedicaidWaiver: false,
        placement: "jewishDay",
        jewishSchoolSlug: "denver_jds",
        grantPct: 0.55,
        tuitionOverrideYearly: 0,
        therapyMonthly: 0,
      },
      {
        id: "kid_b",
        label: "Kid B",
        age: 6,
        hasIEP: true,
        hasMedicaidWaiver: false,
        placement: "publicIEP",
        jewishSchoolSlug: "",
        grantPct: 0,
        tuitionOverrideYearly: 0,
        therapyMonthly: 400,
      },
    ],
    foodMultiplier: 1.3,
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
      tier: "standard",
    },
    transport: {
      hasCar: true,
      usesTransit: false,
      carType: "used_sedan",
    },
    health: {
      strategy: "marketplace",
      usage: "typical",
    },
    customExpenses: [
      {
        id: "exp_phone",
        label: "Phone (family plan)",
        category: "phone",
        amountUsd: 65,
        frequency: "monthly",
        enabled: true,
        notes: "",
      },
      {
        id: "exp_internet",
        label: "Internet",
        category: "internet",
        amountUsd: 60,
        frequency: "monthly",
        enabled: true,
        notes: "",
      },
      {
        id: "exp_clothing",
        label: "Clothing",
        category: "clothing",
        amountUsd: 1500,
        frequency: "yearly",
        enabled: true,
        notes: "",
      },
      {
        id: "exp_activities",
        label: "Kids' activities",
        category: "activities",
        amountUsd: 120,
        frequency: "monthly",
        enabled: true,
        notes: "",
      },
      {
        id: "exp_synagogue",
        label: "Synagogue dues",
        category: "synagogue",
        amountUsd: 1500,
        frequency: "yearly",
        enabled: true,
        notes: "",
      },
      {
        id: "exp_streaming",
        label: "Streaming services",
        category: "subscriptions",
        amountUsd: 35,
        frequency: "monthly",
        enabled: true,
        notes: "",
      },
    ],
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

export interface Scenario {
  id: string;
  name: string;
  profile: FamilyProfile;
  settings: Settings;
  updatedAt: string;
}

const nowIso = () => new Date().toISOString();
const newId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

interface SimState {
  profile: FamilyProfile;
  settings: Settings;
  scenarios: Scenario[];
  activeScenarioId: string;
  setProfile: (p: FamilyProfile) => void;
  setScenarioName: (name: string) => void;
  patchFamily: (p: Partial<FamilyProfile["family"]>) => void;
  patchLifestyle: (p: Partial<FamilyProfile["lifestyle"]>) => void;
  patchParentA: (p: Partial<FamilyProfile["lifestyle"]["parentA"]>) => void;
  patchParentB: (p: Partial<FamilyProfile["lifestyle"]["parentB"]>) => void;
  patchHousing: (p: Partial<FamilyProfile["lifestyle"]["housing"]>) => void;
  patchTransport: (p: Partial<FamilyProfile["lifestyle"]["transport"]>) => void;
  patchHealth: (p: Partial<FamilyProfile["lifestyle"]["health"]>) => void;
  patchCustomExpenses: (items: FamilyProfile["lifestyle"]["customExpenses"]) => void;
  patchSettings: (p: Partial<Settings>) => void;
  patchAssumptions: (p: Partial<Settings["assumptions"]>) => void;
  setCurrency: (c: Settings["currency"]) => void;
  setFxRate: (rate: number, mode: Settings["fx"]["mode"], source?: string, asOf?: string) => void;
  saveActiveScenario: () => void;
  createScenario: (name?: string) => void;
  loadScenario: (id: string) => void;
  renameScenario: (id: string, name: string) => void;
  duplicateScenario: (id: string) => void;
  deleteScenario: (id: string) => void;
  reset: () => void;
  importJson: (raw: unknown) => { ok: boolean; error?: string };
  exportJson: () => string;
  exportShareHash: () => string;
  importShareHash: (hash: string) => { ok: boolean; error?: string };
}

export const useSimStore = create<SimState>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      settings: defaultSettings,
      scenarios: [
        {
          id: "baseline",
          name: defaultProfile.scenarioName,
          profile: defaultProfile,
          settings: defaultSettings,
          updatedAt: nowIso(),
        },
      ],
      activeScenarioId: "baseline",
      setProfile: (p) => set({ profile: p }),
      setScenarioName: (name) =>
        set((s) => ({
          profile: { ...s.profile, scenarioName: name },
          scenarios: s.scenarios.map((scenario) =>
            scenario.id === s.activeScenarioId
              ? { ...scenario, name, profile: { ...s.profile, scenarioName: name }, updatedAt: nowIso() }
              : scenario
          ),
        })),
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
      patchHealth: (p) =>
        set((s) => ({
          profile: {
            ...s.profile,
            lifestyle: { ...s.profile.lifestyle, health: { ...s.profile.lifestyle.health, ...p } },
          },
        })),
      patchCustomExpenses: (items) =>
        set((s) => ({
          profile: {
            ...s.profile,
            lifestyle: { ...s.profile.lifestyle, customExpenses: items },
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
      saveActiveScenario: () =>
        set((s) => ({
          scenarios: s.scenarios.map((scenario) =>
            scenario.id === s.activeScenarioId
              ? {
                  ...scenario,
                  name: s.profile.scenarioName,
                  profile: s.profile,
                  settings: s.settings,
                  updatedAt: nowIso(),
                }
              : scenario
          ),
        })),
      createScenario: (name) =>
        set((s) => {
          const id = newId("scenario");
          const profile = { ...defaultProfile, scenarioName: name ?? "New scenario" };
          return {
            activeScenarioId: id,
            profile,
            settings: defaultSettings,
            scenarios: [
              ...s.scenarios,
              { id, name: profile.scenarioName, profile, settings: defaultSettings, updatedAt: nowIso() },
            ],
          };
        }),
      loadScenario: (id) =>
        set((s) => {
          const scenario = s.scenarios.find((item) => item.id === id);
          if (!scenario) return {};
          return {
            activeScenarioId: id,
            profile: scenario.profile,
            settings: scenario.settings,
          };
        }),
      renameScenario: (id, name) =>
        set((s) => ({
          profile: id === s.activeScenarioId ? { ...s.profile, scenarioName: name } : s.profile,
          scenarios: s.scenarios.map((scenario) =>
            scenario.id === id
              ? { ...scenario, name, profile: { ...scenario.profile, scenarioName: name }, updatedAt: nowIso() }
              : scenario
          ),
        })),
      duplicateScenario: (id) =>
        set((s) => {
          const scenario = s.scenarios.find((item) => item.id === id);
          if (!scenario) return {};
          const newScenario = {
            ...scenario,
            id: newId("scenario"),
            name: `${scenario.name} copy`,
            profile: { ...scenario.profile, scenarioName: `${scenario.name} copy` },
            updatedAt: nowIso(),
          };
          return { scenarios: [...s.scenarios, newScenario] };
        }),
      deleteScenario: (id) =>
        set((s) => {
          if (s.scenarios.length <= 1) return {};
          const scenarios = s.scenarios.filter((scenario) => scenario.id !== id);
          if (s.activeScenarioId !== id) return { scenarios };
          const next = scenarios[0];
          return { scenarios, activeScenarioId: next.id, profile: next.profile, settings: next.settings };
        }),
      reset: () =>
        set({
          profile: defaultProfile,
          settings: defaultSettings,
          activeScenarioId: "baseline",
          scenarios: [
            {
              id: "baseline",
              name: defaultProfile.scenarioName,
              profile: defaultProfile,
              settings: defaultSettings,
              updatedAt: nowIso(),
            },
          ],
        }),
      importJson: (raw) => {
        const full = raw as { appVersion?: number; profile?: unknown; settings?: unknown; scenarios?: Scenario[] } | null;
        if (full && typeof full === "object" && "profile" in full) {
          const profileParsed = familyProfileSchema.safeParse(migrateProfile(full.profile));
          const settingsParsed = settingsSchema.safeParse(full.settings ?? defaultSettings);
          if (!profileParsed.success) return { ok: false, error: profileParsed.error.message };
          if (!settingsParsed.success) return { ok: false, error: settingsParsed.error.message };
          set({
            profile: profileParsed.data,
            settings: settingsParsed.data,
            scenarios: Array.isArray(full.scenarios) ? full.scenarios : get().scenarios,
          });
          return { ok: true };
        }
        const parsed = familyProfileSchema.safeParse(migrateProfile(raw));
        if (!parsed.success) return { ok: false, error: parsed.error.message };
        set({ profile: parsed.data });
        return { ok: true };
      },
      exportJson: () =>
        JSON.stringify(
          {
            appVersion: 2,
            profile: get().profile,
            settings: get().settings,
            scenarios: get().scenarios,
          },
          null,
          2
        ),
      exportShareHash: () => {
        const payload = JSON.stringify({ profile: get().profile, settings: get().settings });
        return `#sim=${btoa(unescape(encodeURIComponent(payload)))}`;
      },
      importShareHash: (hash) => {
        const encoded = hash.startsWith("#sim=") ? hash.slice(5) : hash;
        try {
          const raw = JSON.parse(decodeURIComponent(escape(atob(encoded)))) as {
            profile?: unknown;
            settings?: unknown;
          };
          const profileParsed = familyProfileSchema.safeParse(migrateProfile(raw.profile));
          const settingsParsed = settingsSchema.safeParse(raw.settings ?? defaultSettings);
          if (!profileParsed.success) return { ok: false, error: profileParsed.error.message };
          if (!settingsParsed.success) return { ok: false, error: settingsParsed.error.message };
          set({ profile: profileParsed.data, settings: settingsParsed.data });
          return { ok: true };
        } catch (error) {
          return { ok: false, error: error instanceof Error ? error.message : "Invalid share link" };
        }
      },
    }),
    {
      name: "col-sim-v1",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : undefined as never)),
      partialize: (s) => ({
        profile: s.profile,
        settings: s.settings,
        scenarios: s.scenarios,
        activeScenarioId: s.activeScenarioId,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<SimState> | undefined;
        const merged = { ...current, ...(p ?? {}) };
        const profileOk = familyProfileSchema.safeParse(migrateProfile(merged.profile));
        const settingsOk = settingsSchema.safeParse(merged.settings);
        const scenarios = Array.isArray(merged.scenarios) ? merged.scenarios : current.scenarios;
        return {
          ...merged,
          profile: profileOk.success ? profileOk.data : current.profile,
          settings: settingsOk.success ? settingsOk.data : current.settings,
          scenarios,
          activeScenarioId: merged.activeScenarioId ?? current.activeScenarioId,
        };
      },
    }
  )
);
