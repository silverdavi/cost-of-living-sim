import { describe, it, expect } from "vitest";
import { getDefaultProfile } from "../data/loaders";
import { runSimulation } from "./aggregate";
import { applyBrackets } from "./taxes";
import { householdFpl } from "./aca";

const baseAssumptions = {
  acaExtended: true,
  kosherMultiplierOverride: null as number | null,
  reserveMonthsForGreen: 2,
};

describe("tax brackets", () => {
  it("applies federal MFJ 2025 brackets correctly at 70k taxable", () => {
    const brackets = [
      { upTo: 23850, rate: 0.10 },
      { upTo: 96950, rate: 0.12 },
      { upTo: null as number | null, rate: 0.22 },
    ];
    const tax = applyBrackets(70000, brackets);
    const expected = 23850 * 0.10 + (70000 - 23850) * 0.12;
    expect(Math.round(tax)).toBe(Math.round(expected));
  });
});

describe("FPL table", () => {
  it("household of 4 matches 2025 guideline", () => {
    expect(householdFpl(4)).toBe(32150);
  });
  it("household of 9 extrapolates", () => {
    expect(householdFpl(9)).toBe(54150 + 5500);
  });
});

describe("runSimulation on default profile", () => {
  const profile = getDefaultProfile();

  it("produces a positive gross income with Parent A salary + SSDI", () => {
    const r = runSimulation(profile, baseAssumptions);
    expect(r.income.grossYearly).toBeGreaterThan(60000);
    expect(r.income.ssdiYearly).toBeCloseTo(1580 * 12, 0);
  });

  it("computes ACA subsidy at Denver benchmark for ~55k MAGI household of 4", () => {
    const r = runSimulation(profile, baseAssumptions);
    expect(r.aca.netPremiumYearly).toBeGreaterThanOrEqual(0);
    expect(r.aca.netPremiumYearly).toBeLessThan(1450 * 12);
  });

  it("returns a feasibility verdict", () => {
    const r = runSimulation(profile, baseAssumptions);
    expect(["green", "yellow", "red"]).toContain(r.feasibility);
  });

  it("hasCar=false zeroes out car costs", () => {
    const carless = {
      ...profile,
      lifestyle: {
        ...profile.lifestyle,
        transport: { hasCar: false, usesTransit: true, carType: "used_sedan" as const },
      },
    };
    const r = runSimulation(carless, baseAssumptions);
    expect(r.transport.carYearly).toBe(0);
    expect(r.transport.carInsuranceYearly).toBe(0);
    expect(r.transport.gasYearly).toBe(0);
    expect(r.transport.paymentYearly).toBe(0);
    expect(r.transport.transitYearly).toBeGreaterThan(0);
  });

  it("new_sedan adds a loan payment and trims maintenance", () => {
    const newCar = {
      ...profile,
      lifestyle: {
        ...profile.lifestyle,
        transport: { hasCar: true, usesTransit: false, carType: "new_sedan" as const },
      },
    };
    const baseline = runSimulation(profile, baseAssumptions);
    const r = runSimulation(newCar, baseAssumptions);
    expect(r.transport.paymentYearly).toBe(500 * 12);
    expect(r.transport.maintenanceYearly).toBeLessThan(baseline.transport.maintenanceYearly);
    expect(r.transport.total).toBeGreaterThan(baseline.transport.total);
  });

  it("budget housing tier is cheaper than premium", () => {
    const budget = {
      ...profile,
      lifestyle: {
        ...profile.lifestyle,
        housing: { ...profile.lifestyle.housing, tier: "budget" as const, overrideRent: false },
      },
    };
    const premium = {
      ...profile,
      lifestyle: {
        ...profile.lifestyle,
        housing: { ...profile.lifestyle.housing, tier: "premium" as const, overrideRent: false },
      },
    };
    const b = runSimulation(budget, baseAssumptions);
    const p = runSimulation(premium, baseAssumptions);
    expect(b.housing.monthlyRent).toBeLessThan(p.housing.monthlyRent);
    expect(b.housing.total).toBeLessThan(p.housing.total);
  });

  it("Providence default profile also runs", () => {
    const riProfile = {
      ...profile,
      family: {
        ...profile.family,
        children: profile.family.children.map((child) =>
          child.jewishSchoolSlug ? { ...child, jewishSchoolSlug: "jcdsri" } : child
        ),
      },
      lifestyle: {
        ...profile.lifestyle,
        city: "providence_ri",
      },
    };
    const r = runSimulation(riProfile, baseAssumptions);
    expect(r).toBeDefined();
    expect(r.totalExpensesYearly).toBeGreaterThan(0);
  });

  it("uses dynamic children and custom expenses", () => {
    const baseline = runSimulation(profile, baseAssumptions);
    const expanded = {
      ...profile,
      family: {
        ...profile.family,
        children: [
          ...profile.family.children,
          {
            id: "kid_c",
            label: "Kid C",
            age: 3,
            hasIEP: false,
            hasMedicaidWaiver: false,
            placement: "public" as const,
            jewishSchoolSlug: "",
            grantPct: 0,
            tuitionOverrideYearly: 0,
            therapyMonthly: 0,
          },
        ],
      },
      lifestyle: {
        ...profile.lifestyle,
        customExpenses: [
          ...profile.lifestyle.customExpenses,
          {
            id: "exp_test",
            label: "Test expense",
            category: "other" as const,
            amountUsd: 100,
            frequency: "monthly" as const,
            enabled: true,
            notes: "",
          },
        ],
      },
    };
    const r = runSimulation(expanded, baseAssumptions);
    expect(r.householdSize).toBe(baseline.householdSize + 1);
    expect(r.customExpenses.totalYearly).toBe(baseline.customExpenses.totalYearly + 1200);
  });
});
