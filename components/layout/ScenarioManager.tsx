"use client";

import { useSimStore } from "@/lib/store/useSimStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

export function ScenarioManager() {
  const t = useTranslations("scenarios");
  const profile = useSimStore((s) => s.profile);
  const scenarios = useSimStore((s) => s.scenarios);
  const activeScenarioId = useSimStore((s) => s.activeScenarioId);
  const setScenarioName = useSimStore((s) => s.setScenarioName);
  const saveActiveScenario = useSimStore((s) => s.saveActiveScenario);
  const createScenario = useSimStore((s) => s.createScenario);
  const loadScenario = useSimStore((s) => s.loadScenario);
  const renameScenario = useSimStore((s) => s.renameScenario);
  const duplicateScenario = useSimStore((s) => s.duplicateScenario);
  const deleteScenario = useSimStore((s) => s.deleteScenario);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="chip max-w-[220px] truncate hover:bg-white">
          {profile.scenarioName || t("untitled")}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-3">
        <div className="space-y-3">
          <div>
            <p className="label mb-1">{t("active")}</p>
            <Input
              value={profile.scenarioName}
              onChange={(event) => setScenarioName(event.target.value)}
              aria-label={t("name")}
            />
          </div>
          <Select value={activeScenarioId} onValueChange={loadScenario}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {scenarios.map((scenario) => (
                <SelectItem key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="subtle" onClick={saveActiveScenario}>{t("save")}</Button>
            <Button size="sm" variant="subtle" onClick={() => createScenario()}>{t("new")}</Button>
            <Button size="sm" variant="subtle" onClick={() => duplicateScenario(activeScenarioId)}>{t("duplicate")}</Button>
            <Button
              size="sm"
              variant="subtle"
              onClick={() => renameScenario(activeScenarioId, `${profile.scenarioName}*`)}
            >
              {t("mark")}
            </Button>
          </div>
          <Button
            size="sm"
            variant="subtle"
            className="w-full text-bad"
            onClick={() => deleteScenario(activeScenarioId)}
            disabled={scenarios.length <= 1}
          >
            {t("delete")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
