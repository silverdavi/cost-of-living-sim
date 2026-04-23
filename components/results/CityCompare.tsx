"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Money } from "@/components/controls/Money";
import { runSimulation } from "@/lib/model/aggregate";
import { getAllCities, getSchoolsForCity } from "@/lib/data/loaders";
import { useSimStore } from "@/lib/store/useSimStore";
import type { FamilyProfile } from "@/lib/model/schema";

export function CityCompare() {
  const t = useTranslations();
  const profile = useSimStore((s) => s.profile);
  const assumptions = useSimStore((s) => s.settings.assumptions);

  const results = useMemo(() => {
    const cities = getAllCities();
    return cities.map((city) => {
      const schools = getSchoolsForCity(city.slug);
      const adjusted: FamilyProfile = {
        ...profile,
        lifestyle: {
          ...profile.lifestyle,
          city: city.slug,
          schools: {
            ...profile.lifestyle.schools,
            kidASchool:
              city.schools.includes(profile.lifestyle.schools.kidASchool)
                ? profile.lifestyle.schools.kidASchool
                : (schools[0]?.slug ?? profile.lifestyle.schools.kidASchool),
          },
        },
      };
      const agg = runSimulation(adjusted, assumptions);
      return { city, agg };
    });
  }, [profile, assumptions]);

  const activeCity = profile.lifestyle.city;

  return (
    <div className="card-strong">
      <h3 className="text-base font-semibold">{t("results.compare.title")}</h3>
      <p className="hint mt-1 mb-4">{t("results.compare.subtitle")}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {results.map(({ city, agg }) => (
          <div
            key={city.slug}
            className={`rounded-2xl border p-4 ${
              city.slug === activeCity ? "border-accent/50 bg-accent/5" : "border-line/60 bg-surface"
            }`}
          >
            <div className="text-sm font-semibold mb-2">{t(city.labelKey)}</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="hint">{t("results.headline.grossIncome")}</div>
              <div className="text-end tabular-nums"><Money usd={agg.income.grossYearly} /></div>
              <div className="hint">{t("results.breakdown.taxes")}</div>
              <div className="text-end tabular-nums"><Money usd={agg.taxes.totalTax} /></div>
              <div className="hint">{t("results.breakdown.housing")}</div>
              <div className="text-end tabular-nums"><Money usd={agg.housing.total} /></div>
              <div className="hint">{t("results.breakdown.health")}</div>
              <div className="text-end tabular-nums"><Money usd={agg.aca.netPremiumYearly + agg.oopMedicalYearly} /></div>
              <div className="hint font-medium text-ink">{t("results.headline.netCash")}</div>
              <div className={`text-end tabular-nums font-semibold ${agg.netCashYearly < 0 ? "text-bad" : "text-ok"}`}>
                <Money usd={agg.netCashYearly} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {results.length === 2 && (
        <div className="mt-4 text-sm text-muted">
          {t("results.compare.delta")}:{" "}
          <span className="font-medium text-ink">
            <Money usd={Math.abs(results[0].agg.netCashYearly - results[1].agg.netCashYearly)} />
          </span>{" "}
          — {t(results[0].agg.netCashYearly >= results[1].agg.netCashYearly ? results[0].city.labelKey : results[1].city.labelKey)}
        </div>
      )}
    </div>
  );
}
