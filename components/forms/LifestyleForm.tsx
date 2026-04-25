"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useSimStore } from "@/lib/store/useSimStore";
import { FormCard } from "./FormCard";
import { FieldRow } from "./FieldRow";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getAllCities, getSchoolsForCity, getCity } from "@/lib/data/loaders";
import { computeIncome, computeMagi } from "@/lib/model/income";
import { computeAca, expectedOopMedicalYearly } from "@/lib/model/aca";
import { suggestedGrantPct } from "@/lib/model/schools";
import { HOUSING_TIER_MULTIPLIER, CAR_PROFILES, CAR_MAINTENANCE_YEARLY, type CarType } from "@/lib/model/expenses";
import { getSchool } from "@/lib/data/loaders";
import { federal } from "@/lib/data/loaders";
import { Money } from "@/components/controls/Money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InkHouse } from "@/components/illustrations/InkHouse";
import { InkSchool } from "@/components/illustrations/InkSchool";
import { InkHeart } from "@/components/illustrations/InkHeart";
import { InkWallet } from "@/components/illustrations/InkWallet";
import { InkCar } from "@/components/illustrations/InkCar";
import { InkFamily } from "@/components/illustrations/InkFamily";
import { InkCart } from "@/components/illustrations/InkCart";
import type { Child, ChildPlacement, CustomExpense, ExpenseCategory } from "@/lib/model/schema";

const JOBS = [
  "local_newspaper",
  "nonprofit_communications",
  "community_org",
  "freelance_journalism",
] as const;

const HOUSING_TIERS = ["budget", "standard", "premium"] as const;

const CAR_TYPES: CarType[] = [
  "used_compact",
  "used_sedan",
  "used_minivan",
  "new_compact",
  "new_sedan",
  "new_minivan",
];

const CHILD_PLACEMENTS: ChildPlacement[] = [
  "public",
  "publicIEP",
  "publicSpecial",
  "privateDistrictFunded",
  "privateSelfPay",
  "jewishDay",
  "jewishDayWithSupport",
];

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
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

export function LifestyleForm() {
  const t = useTranslations();
  const profile = useSimStore((s) => s.profile);
  const assumptions = useSimStore((s) => s.settings.assumptions);
  const patchLifestyle = useSimStore((s) => s.patchLifestyle);
  const patchParentA = useSimStore((s) => s.patchParentA);
  const patchParentB = useSimStore((s) => s.patchParentB);
  const patchHousing = useSimStore((s) => s.patchHousing);
  const patchTransport = useSimStore((s) => s.patchTransport);
  const patchHealth = useSimStore((s) => s.patchHealth);
  const patchFamily = useSimStore((s) => s.patchFamily);
  const patchCustomExpenses = useSimStore((s) => s.patchCustomExpenses);
  const family = profile.family;
  const children = family.children;
  const householdSize = 2 + children.length;

  const cities = useMemo(() => getAllCities(), []);
  const citySchools = useMemo(
    () => getSchoolsForCity(profile.lifestyle.city),
    [profile.lifestyle.city]
  );
  const city = useMemo(() => getCity(profile.lifestyle.city), [profile.lifestyle.city]);

  const income = computeIncome(profile, federal.ssdi.sgaMonthlyNonBlind);
  const magi = computeMagi(income);

  const parentB = profile.lifestyle.parentB;
  const sgaWarning = parentB.mode === "ssdi" && parentB.grossSalaryUsd > federal.ssdi.sgaMonthlyNonBlind * 12;

  const aca = useMemo(
    () =>
      computeAca({
        magi,
        householdSize,
        benchmarkYearly: city.acaBenchmarkFamily4Monthly * 12,
        chipKidsPctFplCap: city.chip.kidsPctFplCap,
        acaExtended: assumptions.acaExtended,
        strategy: profile.lifestyle.health.strategy,
        employerPremiumYearly: profile.lifestyle.parentA.employerPremiumYearlyUsd,
      }),
    [
      magi,
      householdSize,
      city,
      assumptions.acaExtended,
      profile.lifestyle.health.strategy,
      profile.lifestyle.parentA.employerPremiumYearlyUsd,
    ]
  );
  const oopYearly = expectedOopMedicalYearly(
    profile.lifestyle.health.usage,
    aca.onMedicaid,
    profile.lifestyle.health.strategy
  );

  const br = String(profile.lifestyle.housing.bedrooms);
  const cityMedianRent = city.housing.medianRentByBedrooms[br] ?? 0;

  const tier = profile.lifestyle.housing.tier ?? "standard";
  const tierMult = HOUSING_TIER_MULTIPLIER[tier];

  const baselineRent = (c: typeof city, bedrooms: number, t: keyof typeof HOUSING_TIER_MULTIPLIER) => {
    const median = c.housing.medianRentByBedrooms[String(bedrooms)] ?? 0;
    return Math.round(median * HOUSING_TIER_MULTIPLIER[t] * (1 + c.housing.jewishNeighborhoodPremium));
  };

  const onCityChange = (slug: string) => {
    const nextCity = getCity(slug);
    const nextSchools = getSchoolsForCity(slug);
    const nextSchoolSlug = nextSchools[0]?.slug ?? "";
    patchLifestyle({ city: slug });
    if (!profile.lifestyle.housing.overrideRent) {
      patchHousing({
        monthlyRentUsd: baselineRent(nextCity, profile.lifestyle.housing.bedrooms, tier),
      });
    }
    patchFamily({
      children: children.map((child) =>
        child.placement === "jewishDay" || child.placement === "jewishDayWithSupport"
          ? { ...child, jewishSchoolSlug: nextSchoolSlug }
          : child
      ),
    });
  };

  const onTierChange = (next: keyof typeof HOUSING_TIER_MULTIPLIER) => {
    if (!profile.lifestyle.housing.overrideRent) {
      patchHousing({
        tier: next,
        monthlyRentUsd: baselineRent(city, profile.lifestyle.housing.bedrooms, next),
      });
    } else {
      patchHousing({ tier: next });
    }
  };

  const onBedroomsChange = (bedrooms: number) => {
    if (!profile.lifestyle.housing.overrideRent) {
      patchHousing({
        bedrooms,
        monthlyRentUsd: baselineRent(city, bedrooms, tier),
      });
    } else {
      patchHousing({ bedrooms });
    }
  };

  const patchChild = (id: string, patch: Partial<Child>) => {
    patchFamily({
      children: children.map((child) => (child.id === id ? { ...child, ...patch } : child)),
    });
  };

  const addChild = () => {
    const firstSchool = citySchools[0]?.slug ?? "";
    const nextNumber = children.length + 1;
    patchFamily({
      children: [
        ...children,
        {
          id: `child_${Date.now()}`,
          label: `${t("family.kids.child")} ${nextNumber}`,
          age: 6,
          hasIEP: false,
          hasMedicaidWaiver: false,
          placement: "public",
          jewishSchoolSlug: firstSchool,
          grantPct: 0,
          tuitionOverrideYearly: 0,
          therapyMonthly: 0,
        },
      ],
    });
  };

  const duplicateChild = (child: Child) => {
    patchFamily({
      children: [
        ...children,
        {
          ...child,
          id: `child_${Date.now()}`,
          label: `${child.label || t("family.kids.child")} ${t("actions.copy")}`,
        },
      ],
    });
  };

  const removeChild = (id: string) => {
    patchFamily({ children: children.filter((child) => child.id !== id) });
  };

  const patchExpense = (id: string, patch: Partial<CustomExpense>) => {
    patchCustomExpenses(
      profile.lifestyle.customExpenses.map((expense) =>
        expense.id === id ? { ...expense, ...patch } : expense
      )
    );
  };

  const addExpense = () => {
    patchCustomExpenses([
      ...profile.lifestyle.customExpenses,
      {
        id: `exp_${Date.now()}`,
        label: t("expenses.newExpense"),
        category: "other",
        amountUsd: 0,
        frequency: "monthly",
        enabled: true,
        notes: "",
      },
    ]);
  };

  const removeExpense = (id: string) => {
    patchCustomExpenses(profile.lifestyle.customExpenses.filter((expense) => expense.id !== id));
  };

  const carType: CarType = profile.lifestyle.transport.carType ?? "used_sedan";
  const carProfile = CAR_PROFILES[carType];
  const carYearlyPreview =
    Math.round(city.transport.carInsuranceYearly * carProfile.insuranceMult) +
    Math.round(city.transport.gasMonthly * 12 * carProfile.gasMult) +
    Math.round(CAR_MAINTENANCE_YEARLY * carProfile.maintenanceMult) +
    carProfile.monthlyPayment * 12;

  const yearly = (monthly: number) => (
    <>
      × 12 = <Money usd={monthly * 12} />
      <span className="mx-1">/</span>
      {t("units.perYear").replace("/", "").trim()}
    </>
  );

  const chip = (label: string, value: React.ReactNode) => (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-line/60 bg-white/60 px-3 py-2">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-sm font-semibold text-ink">{value}</span>
    </div>
  );

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-4">
        <div className="card-strong">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">{profile.scenarioName}</span>
            <span className="chip">{t(city.labelKey)}</span>
            <span className="chip">{t("family.kids.householdSize", { count: householdSize })}</span>
            <span className="chip"><Money usd={income.grossYearly} /></span>
            {sgaWarning && <span className="chip border-warn/60 bg-warn/15">{t("lifestyle.income.parentB.sgaWarn", { sga: federal.ssdi.sgaMonthlyNonBlind })}</span>}
          </div>
          <div className="no-print mt-3 flex flex-wrap gap-2 text-xs">
            {["city", "housing", "income", "transport", "food", "kids", "expenses", "health"].map((id) => (
              <a key={id} href={`#${id}`} className="rounded-full px-3 py-1 text-muted hover:bg-surface">
                {t(`setupNav.${id}`)}
              </a>
            ))}
          </div>
        </div>
      <div className="grid gap-6 md:grid-cols-2">
        {/* CITY + SNAPSHOT */}
        <div id="city" className="contents">
        <FormCard
          title={t("lifestyle.city.title")}
          subtitle={t("lifestyle.city.hint")}
          illustration={<InkHouse className="h-16 w-16" />}
        >
          <FieldRow label={t("lifestyle.city.label")} hint={t("lifestyle.city.hint")}>
            <Select value={profile.lifestyle.city} onValueChange={onCityChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {t(c.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>

          <div className="mt-2">
            <p className="label mb-2">{t("lifestyle.city.snapshot")}</p>
            <div className="grid grid-cols-2 gap-2">
              {chip(
                t("lifestyle.city.medianRent", { br: profile.lifestyle.housing.bedrooms }),
                <Money usd={cityMedianRent} />
              )}
              {chip(
                t("lifestyle.city.acaBenchmark"),
                <Money usd={city.acaBenchmarkFamily4Monthly * 12} />
              )}
              {chip(
                t("lifestyle.city.carInsurance"),
                <Money usd={city.transport.carInsuranceYearly} />
              )}
              {chip(
                t("lifestyle.city.kosherMult"),
                `×${city.food.kosherMultiplier.toFixed(2)}`
              )}
            </div>
          </div>
        </FormCard>
        </div>

        {/* HOUSING */}
        <div id="housing" className="contents">
        <FormCard
          title={t("lifestyle.housing.title")}
          illustration={<InkHouse className="h-16 w-16" />}
        >
          <FieldRow
            label={t("lifestyle.housing.bedrooms")}
            hint={t("lifestyle.housing.bedroomsHint")}
            valueBadge={<div className="chip">{profile.lifestyle.housing.bedrooms}</div>}
          >
            <Slider
              value={[profile.lifestyle.housing.bedrooms]}
              min={1}
              max={4}
              step={1}
              onValueChange={(v) => onBedroomsChange(v[0])}
            />
          </FieldRow>

          <FieldRow
            label={t("lifestyle.housing.tier")}
            hint={t("lifestyle.housing.tierHint")}
            valueBadge={<div className="chip">×{tierMult.toFixed(2)}</div>}
          >
            <Select
              value={tier}
              onValueChange={(v) => onTierChange(v as keyof typeof HOUSING_TIER_MULTIPLIER)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {HOUSING_TIERS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {t(`lifestyle.housing.tiers.${opt}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>

          <FieldRow
            label={t("lifestyle.housing.rent")}
            hint={t("lifestyle.housing.rentHint")}
            valueBadge={
              <div className="chip">
                <Money usd={profile.lifestyle.housing.monthlyRentUsd} />
                <span className="ms-1 text-muted">{t("units.perMonth")}</span>
              </div>
            }
            caption={yearly(profile.lifestyle.housing.monthlyRentUsd)}
          >
            <div className="flex items-center gap-3">
              <Slider
                value={[profile.lifestyle.housing.monthlyRentUsd]}
                min={800}
                max={5000}
                step={50}
                onValueChange={(v) => patchHousing({ monthlyRentUsd: v[0], overrideRent: true })}
                className="flex-1"
              />
              <Button
                size="sm"
                variant="subtle"
                title={t("lifestyle.housing.resetDefault")}
                onClick={() => {
                  patchHousing({
                    monthlyRentUsd: baselineRent(city, profile.lifestyle.housing.bedrooms, tier),
                    overrideRent: false,
                  });
                }}
              >
                ↻
              </Button>
            </div>
          </FieldRow>
        </FormCard>
        </div>

        {/* PARENT A */}
        <FormCard
          title={`${t("lifestyle.income.parentATitle")}`}
          subtitle={t("family.adults.parentA")}
          illustration={<InkWallet className="h-16 w-16" />}
        >
          <FieldRow
            label={t("lifestyle.income.parentA.employed")}
            hint={t("lifestyle.income.parentA.employedHint")}
          >
            <Switch
              checked={profile.lifestyle.parentA.employed}
              onCheckedChange={(v) => patchParentA({ employed: v })}
              aria-label={t("lifestyle.income.parentA.employed")}
            />
          </FieldRow>

          <FieldRow
            label={t("lifestyle.income.parentA.job")}
            hint={t("lifestyle.income.parentA.jobHint")}
          >
            <Select
              value={profile.lifestyle.parentA.jobType}
              onValueChange={(v) => patchParentA({ jobType: v as typeof profile.lifestyle.parentA.jobType })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {JOBS.map((j) => (
                  <SelectItem key={j} value={j}>{t(`jobs.${j}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>

          <FieldRow
            label={t("lifestyle.income.parentA.salary")}
            hint={t("lifestyle.income.parentA.salaryHint")}
            valueBadge={
              <div className="chip">
                <Money usd={profile.lifestyle.parentA.grossSalaryUsd} />
                <span className="ms-1 text-muted">{t("units.perYear")}</span>
              </div>
            }
          >
            <Slider
              value={[profile.lifestyle.parentA.grossSalaryUsd]}
              min={0}
              max={120000}
              step={1000}
              onValueChange={(v) => patchParentA({ grossSalaryUsd: v[0] })}
            />
          </FieldRow>

          <FieldRow
            label={t("lifestyle.income.parentA.employerHealth")}
            hint={t("lifestyle.income.parentA.employerHealthHint")}
          >
            <Switch
              checked={profile.lifestyle.parentA.hasEmployerHealth}
              onCheckedChange={(v) => patchParentA({ hasEmployerHealth: v })}
              aria-label={t("lifestyle.income.parentA.employerHealth")}
            />
          </FieldRow>

          {profile.lifestyle.parentA.hasEmployerHealth && (
            <FieldRow
              label={t("lifestyle.income.parentA.employerPremium")}
              hint={t("lifestyle.income.parentA.employerPremiumHint")}
              valueBadge={
                <div className="chip">
                  <Money usd={profile.lifestyle.parentA.employerPremiumYearlyUsd} />
                  <span className="ms-1 text-muted">{t("units.perYear")}</span>
                </div>
              }
            >
              <Slider
                value={[profile.lifestyle.parentA.employerPremiumYearlyUsd]}
                min={0}
                max={15000}
                step={250}
                onValueChange={(v) => patchParentA({ employerPremiumYearlyUsd: v[0] })}
              />
            </FieldRow>
          )}
        </FormCard>

        {/* PARENT B */}
        <FormCard
          title={`${t("lifestyle.income.parentBTitle")}`}
          subtitle={t("family.adults.parentB")}
          illustration={<InkFamily className="h-16 w-16" />}
        >
          <FieldRow
            label={t("lifestyle.income.parentB.mode")}
            hint={t("lifestyle.income.parentB.modeHint")}
          >
            <Select
              value={parentB.mode}
              onValueChange={(v) => patchParentB({ mode: v as typeof parentB.mode })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="employed">{t("lifestyle.income.parentB.modes.employed")}</SelectItem>
                <SelectItem value="ssdi">{t("lifestyle.income.parentB.modes.ssdi")}</SelectItem>
                <SelectItem value="ssi">{t("lifestyle.income.parentB.modes.ssi")}</SelectItem>
                <SelectItem value="none">{t("lifestyle.income.parentB.modes.none")}</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>

          {parentB.mode === "employed" && (
            <FieldRow
              label={t("lifestyle.income.parentB.salary")}
              hint={t("lifestyle.income.parentB.salaryHint")}
              valueBadge={
                <div className="chip">
                  <Money usd={parentB.grossSalaryUsd} />
                  <span className="ms-1 text-muted">{t("units.perYear")}</span>
                </div>
              }
            >
              <Slider
                value={[parentB.grossSalaryUsd]}
                min={0}
                max={80000}
                step={500}
                onValueChange={(v) => patchParentB({ grossSalaryUsd: v[0] })}
              />
            </FieldRow>
          )}

          {parentB.mode === "ssdi" && (
            <>
              <FieldRow
                label={t("lifestyle.income.parentB.ssdiMonthly")}
                hint={t("lifestyle.income.parentB.ssdiMonthlyHint")}
                valueBadge={
                  <div className="chip">
                    <Money usd={parentB.ssdiMonthlyUsd} />
                    <span className="ms-1 text-muted">{t("units.perMonth")}</span>
                  </div>
                }
                caption={yearly(parentB.ssdiMonthlyUsd)}
              >
                <Slider
                  value={[parentB.ssdiMonthlyUsd]}
                  min={0}
                  max={4000}
                  step={20}
                  onValueChange={(v) => patchParentB({ ssdiMonthlyUsd: v[0] })}
                />
              </FieldRow>
              <FieldRow
                label={t("lifestyle.income.parentB.salary")}
                hint={t("lifestyle.income.parentB.sgaWarn", { sga: federal.ssdi.sgaMonthlyNonBlind })}
                valueBadge={
                  <div className="chip">
                    <Money usd={parentB.grossSalaryUsd} />
                    <span className="ms-1 text-muted">{t("units.perYear")}</span>
                  </div>
                }
              >
                <Slider
                  value={[parentB.grossSalaryUsd]}
                  min={0}
                  max={30000}
                  step={250}
                  onValueChange={(v) => patchParentB({ grossSalaryUsd: v[0] })}
                />
                {sgaWarning && (
                  <div className="mt-2 text-xs text-bad">
                    ⚠ {t("lifestyle.income.parentB.sgaWarn", { sga: federal.ssdi.sgaMonthlyNonBlind })}
                  </div>
                )}
              </FieldRow>
            </>
          )}

          {parentB.mode === "ssi" && (
            <FieldRow
              label={t("lifestyle.income.parentB.ssiMonthly")}
              hint={t("lifestyle.income.parentB.ssiMonthlyHint")}
              valueBadge={
                <div className="chip">
                  <Money usd={parentB.ssiMonthlyUsd} />
                  <span className="ms-1 text-muted">{t("units.perMonth")}</span>
                </div>
              }
              caption={yearly(parentB.ssiMonthlyUsd)}
            >
              <Slider
                value={[parentB.ssiMonthlyUsd]}
                min={0}
                max={federal.ssi.federalMaxSingle}
                step={10}
                onValueChange={(v) => patchParentB({ ssiMonthlyUsd: v[0] })}
              />
            </FieldRow>
          )}
        </FormCard>

        {/* TRANSPORT */}
        <FormCard
          title={t("lifestyle.transport.title")}
          illustration={<InkCar className="h-16 w-16" />}
        >
          <FieldRow
            label={t("lifestyle.transport.hasCar")}
            hint={t("lifestyle.transport.hasCarHint")}
            valueBadge={
              profile.lifestyle.transport.hasCar ? (
                <div className="chip">
                  <Money usd={carYearlyPreview} />
                  <span className="ms-1 text-muted">{t("units.perYear")}</span>
                </div>
              ) : undefined
            }
          >
            <Switch
              checked={profile.lifestyle.transport.hasCar}
              onCheckedChange={(v) => patchTransport({ hasCar: v })}
              aria-label={t("lifestyle.transport.hasCar")}
            />
          </FieldRow>

          {profile.lifestyle.transport.hasCar && (
            <FieldRow
              label={t("lifestyle.transport.carType")}
              hint={t("lifestyle.transport.carTypeHint")}
              valueBadge={
                carProfile.monthlyPayment > 0 ? (
                  <div className="chip">
                    <Money usd={carProfile.monthlyPayment} />
                    <span className="ms-1 text-muted">{t("units.perMonth")}</span>
                  </div>
                ) : undefined
              }
              caption={
                carProfile.monthlyPayment > 0 ? (
                  <>
                    {t("lifestyle.transport.monthlyPaymentLabel")}
                    {": "}
                    <Money usd={carProfile.monthlyPayment * 12} />
                    <span className="mx-1">/</span>
                    {t("units.perYear").replace("/", "").trim()}
                  </>
                ) : undefined
              }
            >
              <Select
                value={carType}
                onValueChange={(v) => patchTransport({ carType: v as CarType })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CAR_TYPES.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {t(`lifestyle.transport.carTypes.${opt}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>
          )}

          <FieldRow
            label={t("lifestyle.transport.usesTransit")}
            hint={t("lifestyle.transport.usesTransitHint")}
            valueBadge={
              <div className="chip">
                <Money usd={city.transport.transitPassMonthly} />
                <span className="ms-1 text-muted">{t("units.perMonth")}</span>
              </div>
            }
          >
            <Switch
              checked={profile.lifestyle.transport.usesTransit}
              onCheckedChange={(v) => patchTransport({ usesTransit: v })}
              aria-label={t("lifestyle.transport.usesTransit")}
            />
          </FieldRow>
          {!profile.lifestyle.transport.hasCar && (
            <p className="hint">{t("lifestyle.transport.noCarNote")}</p>
          )}
        </FormCard>

        {/* FOOD MULTIPLIER */}
        <FormCard
          title={t("family.food.title")}
          subtitle={t("family.food.subtitle")}
          illustration={<InkCart className="h-16 w-16" />}
        >
          <FieldRow
            label={t("family.food.multiplier")}
            hint={t("family.food.multiplierHint")}
            valueBadge={<div className="chip">×{family.foodMultiplier.toFixed(2)}</div>}
            caption={t("family.food.caption", {
              cityMult: city.food.kosherMultiplier.toFixed(2),
            })}
          >
            <div className="flex items-center gap-3">
              <Slider
                value={[family.foodMultiplier]}
                min={0.8}
                max={2.0}
                step={0.05}
                onValueChange={(v) => patchFamily({ foodMultiplier: Number(v[0].toFixed(2)) })}
                className="flex-1"
              />
              <Button
                size="sm"
                variant="subtle"
                title={t("family.food.resetCity")}
                onClick={() => patchFamily({ foodMultiplier: city.food.kosherMultiplier })}
              >
                ×{city.food.kosherMultiplier.toFixed(2)}
              </Button>
              <Button
                size="sm"
                variant="subtle"
                title={t("family.food.resetPlain")}
                onClick={() => patchFamily({ foodMultiplier: 1.0 })}
              >
                ×1.00
              </Button>
            </div>
          </FieldRow>
        </FormCard>

        {/* FLEXIBLE CHILDREN */}
        <FormCard
          title={t("family.kids.title")}
          subtitle={t("family.kids.subtitle")}
          illustration={<InkSchool className="h-16 w-16" />}
          className="md:col-span-2"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="chip">{t("family.kids.householdSize", { count: householdSize })}</div>
            <Button size="sm" variant="subtle" onClick={addChild}>
              {t("family.kids.add")}
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {children.map((child, index) => {
              const school = (() => {
                try {
                  return child.jewishSchoolSlug ? getSchool(child.jewishSchoolSlug) : null;
                } catch {
                  return null;
                }
              })();
              const suggested = school ? suggestedGrantPct(school, magi) : 0;
              const usesJewishSchool =
                child.placement === "jewishDay" || child.placement === "jewishDayWithSupport";
              const usesPrivateTuition = child.placement === "privateSelfPay";

              return (
                <div key={child.id} className="rounded-2xl border border-line/70 bg-white/55 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <Input
                      value={child.label}
                      onChange={(event) => patchChild(child.id, { label: event.target.value })}
                      aria-label={t("family.kids.name")}
                      className="max-w-48"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="subtle" onClick={() => duplicateChild(child)}>
                        {t("actions.duplicate")}
                      </Button>
                      <Button size="sm" variant="subtle" onClick={() => removeChild(child.id)} disabled={children.length <= 1}>
                        {t("actions.remove")}
                      </Button>
                    </div>
                  </div>

                  <FieldRow
                    label={t("family.kids.age")}
                    hint={t("family.kids.ageHint")}
                    valueBadge={<div className="chip">{child.age}</div>}
                  >
                    <Slider
                      value={[child.age]}
                      min={0}
                      max={18}
                      step={1}
                      onValueChange={(v) => patchChild(child.id, { age: v[0] })}
                    />
                  </FieldRow>

                  <FieldRow label={t("family.kids.placement")} hint={t("family.kids.placementHint")}>
                    <Select
                      value={child.placement}
                      onValueChange={(v) => patchChild(child.id, { placement: v as ChildPlacement })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CHILD_PLACEMENTS.map((p) => (
                          <SelectItem key={p} value={p}>{t(`family.kids.placements.${p}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldRow>

                  {usesJewishSchool && (
                    <>
                      <FieldRow label={t("lifestyle.schools.kidA.school")} hint={t("lifestyle.schools.kidA.schoolHint")}>
                        <Select
                          value={child.jewishSchoolSlug}
                          onValueChange={(v) => patchChild(child.id, { jewishSchoolSlug: v })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {citySchools.map((s) => (
                              <SelectItem key={s.slug} value={s.slug}>{t(s.labelKey)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FieldRow>

                      <FieldRow
                        label={t("lifestyle.schools.kidA.grant")}
                        hint={t("lifestyle.schools.kidA.grantHint")}
                        valueBadge={
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="subtle" onClick={() => patchChild(child.id, { grantPct: suggested })}>
                              {t("actions.applySuggested")} {Math.round(suggested * 100)}%
                            </Button>
                            <div className="chip">{Math.round(child.grantPct * 100)}%</div>
                          </div>
                        }
                      >
                        <Slider
                          value={[child.grantPct]}
                          min={0}
                          max={0.9}
                          step={0.05}
                          onValueChange={(v) => patchChild(child.id, { grantPct: v[0] })}
                        />
                      </FieldRow>
                    </>
                  )}

                  <FieldRow label={t("family.kids.hasIEP")} hint={t("family.kids.iepHint")}>
                    <Switch
                      checked={child.hasIEP}
                      onCheckedChange={(v) => patchChild(child.id, { hasIEP: v })}
                      aria-label={t("family.kids.hasIEP")}
                    />
                  </FieldRow>

                  <FieldRow label={t("family.kids.hasWaiver")} hint={t("family.kids.waiverHint")}>
                    <Switch
                      checked={child.hasMedicaidWaiver}
                      onCheckedChange={(v) => patchChild(child.id, { hasMedicaidWaiver: v })}
                      aria-label={t("family.kids.hasWaiver")}
                    />
                  </FieldRow>

                  <FieldRow
                    label={t("lifestyle.schools.kidB.therapy")}
                    hint={t("lifestyle.schools.kidB.therapyHint")}
                    valueBadge={
                      <div className="chip">
                        <Money usd={child.therapyMonthly} />
                        <span className="ms-1 text-muted">{t("units.perMonth")}</span>
                      </div>
                    }
                    caption={yearly(child.therapyMonthly)}
                  >
                    <Slider
                      value={[child.therapyMonthly]}
                      min={0}
                      max={2000}
                      step={50}
                      onValueChange={(v) => patchChild(child.id, { therapyMonthly: v[0] })}
                    />
                  </FieldRow>

                  {usesPrivateTuition && (
                    <FieldRow
                      label={t("lifestyle.schools.kidB.tuition")}
                      hint={t("lifestyle.schools.kidB.tuitionHint")}
                      valueBadge={
                        <div className="chip">
                          <Money usd={child.tuitionOverrideYearly} />
                          <span className="ms-1 text-muted">{t("units.perYear")}</span>
                        </div>
                      }
                    >
                      <Slider
                        value={[child.tuitionOverrideYearly]}
                        min={0}
                        max={60000}
                        step={500}
                        onValueChange={(v) => patchChild(child.id, { tuitionOverrideYearly: v[0] })}
                      />
                    </FieldRow>
                  )}

                  <p className="mt-3 text-xs text-muted">
                    {t("family.kids.childNumber", { n: index + 1 })}
                  </p>
                </div>
              );
            })}
          </div>
        </FormCard>

        {/* CUSTOM EXPENSES */}
        <FormCard
          title={t("expenses.title")}
          subtitle={t("expenses.subtitle")}
          illustration={<InkWallet className="h-16 w-16" />}
          className="md:col-span-2"
        >
          <div className="mb-4 flex justify-end">
            <Button size="sm" variant="subtle" onClick={addExpense}>
              {t("expenses.add")}
            </Button>
          </div>
          <div className="space-y-3">
            {profile.lifestyle.customExpenses.map((expense) => (
              <div key={expense.id} className="grid gap-3 rounded-2xl border border-line/70 bg-white/55 p-3 lg:grid-cols-[1.4fr_1fr_0.8fr_0.8fr_auto_auto]">
                <Input
                  value={expense.label}
                  onChange={(event) => patchExpense(expense.id, { label: event.target.value })}
                  aria-label={t("expenses.name")}
                />
                <Select
                  value={expense.category}
                  onValueChange={(v) => patchExpense(expense.id, { category: v as ExpenseCategory })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>{t(`expenses.categories.${category}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={0}
                  value={expense.amountUsd}
                  onChange={(event) => patchExpense(expense.id, { amountUsd: Number(event.target.value) || 0 })}
                  aria-label={t("expenses.amount")}
                />
                <Select
                  value={expense.frequency}
                  onValueChange={(v) => patchExpense(expense.id, { frequency: v as CustomExpense["frequency"] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">{t("expenses.frequency.monthly")}</SelectItem>
                    <SelectItem value="yearly">{t("expenses.frequency.yearly")}</SelectItem>
                    <SelectItem value="oneTime">{t("expenses.frequency.oneTime")}</SelectItem>
                  </SelectContent>
                </Select>
                <Switch
                  checked={expense.enabled}
                  onCheckedChange={(v) => patchExpense(expense.id, { enabled: v })}
                  aria-label={t("expenses.enabled")}
                />
                <Button size="sm" variant="subtle" onClick={() => removeExpense(expense.id)}>
                  {t("actions.remove")}
                </Button>
              </div>
            ))}
          </div>
        </FormCard>

        {/* HEALTH with summary */}
        <FormCard
          title={t("lifestyle.health.title")}
          illustration={<InkHeart className="h-16 w-16" />}
          className="md:col-span-2"
        >
          <div className="grid gap-6 lg:grid-cols-3">
            <FieldRow
              label={t("lifestyle.health.strategy")}
              hint={t("lifestyle.health.strategyHint")}
            >
              <Select
                value={profile.lifestyle.health.strategy}
                onValueChange={(v) => patchHealth({ strategy: v as typeof profile.lifestyle.health.strategy })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="employerFamily">{t("lifestyle.health.strategies.employerFamily")}</SelectItem>
                  <SelectItem value="marketplace">{t("lifestyle.health.strategies.marketplace")}</SelectItem>
                  <SelectItem value="medicaid">{t("lifestyle.health.strategies.medicaid")}</SelectItem>
                  <SelectItem value="mixed">{t("lifestyle.health.strategies.mixed")}</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>

            <FieldRow
              label={t("lifestyle.health.usage")}
              hint={t("lifestyle.health.usageHint")}
            >
              <Select
                value={profile.lifestyle.health.usage}
                onValueChange={(v) => patchHealth({ usage: v as typeof profile.lifestyle.health.usage })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t("lifestyle.health.usages.low")}</SelectItem>
                  <SelectItem value="typical">{t("lifestyle.health.usages.typical")}</SelectItem>
                  <SelectItem value="high">{t("lifestyle.health.usages.high")}</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>

            <div>
              <p className="label mb-2">{t("lifestyle.health.summary")}</p>
              <div className="grid grid-cols-2 gap-2">
                {chip(t("lifestyle.health.onMedicaid"), aca.onMedicaid ? "✓" : "—")}
                {chip(t("lifestyle.health.kidsOnChip"), aca.kidsOnChip ? "✓" : "—")}
                {chip(
                  t("lifestyle.health.fplPct"),
                  `${Math.round(aca.magiPctFpl * 100)}%`
                )}
                {chip(
                  t("lifestyle.health.netPremium"),
                  <Money usd={aca.netPremiumYearly} />
                )}
                {chip(
                  t("lifestyle.health.oopEstimate"),
                  <Money usd={oopYearly} />
                )}
              </div>
            </div>
          </div>
        </FormCard>
      </div>
      </div>
    </TooltipProvider>
  );
}
