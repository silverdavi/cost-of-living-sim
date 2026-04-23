"use client";

import { useMemo } from "react";
import { useSimStore } from "@/lib/store/useSimStore";
import { runSimulation } from "@/lib/model/aggregate";
import { FeasibilityBadge } from "./FeasibilityBadge";
import { HeadlineNumbers } from "./HeadlineNumbers";
import { SankeyFlow } from "./SankeyFlow";
import { YearlyBreakdown } from "./YearlyBreakdown";
import { CliffChart } from "./CliffChart";
import { CityCompare } from "./CityCompare";
import { ExpenseBreakdownList, MasterEquation } from "./ExpenseBreakdownList";

export function ResultsView() {
  const profile = useSimStore((s) => s.profile);
  const assumptions = useSimStore((s) => s.settings.assumptions);

  const agg = useMemo(() => runSimulation(profile, assumptions), [profile, assumptions]);

  return (
    <div className="space-y-6">
      <FeasibilityBadge status={agg.feasibility} />
      <HeadlineNumbers agg={agg} />
      <MasterEquation agg={agg} />
      <SankeyFlow agg={agg} />
      <div className="grid gap-6 lg:grid-cols-2">
        <YearlyBreakdown agg={agg} />
        <ExpenseBreakdownList agg={agg} />
      </div>
      <CliffChart profile={profile} />
      <CityCompare />
    </div>
  );
}
