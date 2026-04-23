"use client";

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
import { InkFamily } from "@/components/illustrations/InkFamily";
import { InkCart } from "@/components/illustrations/InkCart";

export function FamilyForm() {
  const t = useTranslations();
  const family = useSimStore((s) => s.profile.family);
  const patch = useSimStore((s) => s.patchFamily);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="grid gap-6 md:grid-cols-2">
        <FormCard
          title={`${t("family.kids.kidA")} (${t("family.kids.olderTag")})`}
          subtitle={t("family.kids.kidASubtitle")}
          illustration={<InkFamily className="h-16 w-16" />}
        >
          <FieldRow
            label={t("family.kids.age")}
            hint={t("family.kids.ageHint")}
            valueBadge={<div className="chip">{family.kidAAge}</div>}
          >
            <Slider
              value={[family.kidAAge]}
              min={5}
              max={10}
              step={1}
              onValueChange={(v) => patch({ kidAAge: v[0] })}
            />
          </FieldRow>
          <p className="hint">{t("family.kids.kidAFootnote")}</p>
        </FormCard>

        <FormCard
          title={`${t("family.kids.kidB")} (${t("family.kids.youngerTag")})`}
          subtitle={t("family.kids.kidBSubtitle")}
          illustration={<InkFamily className="h-16 w-16" />}
        >
          <FieldRow
            label={t("family.kids.age")}
            hint={t("family.kids.ageHint")}
            valueBadge={<div className="chip">{family.kidBAge}</div>}
          >
            <Slider
              value={[family.kidBAge]}
              min={5}
              max={10}
              step={1}
              onValueChange={(v) => patch({ kidBAge: v[0] })}
            />
          </FieldRow>

          <div className="divider" />

          <FieldRow
            label={t("family.kids.kidBHasIEP")}
            hint={t("family.kids.iepHint")}
          >
            <Switch
              checked={family.kidBHasIEP}
              onCheckedChange={(v) => patch({ kidBHasIEP: v })}
              aria-label={t("family.kids.kidBHasIEP")}
            />
          </FieldRow>

          <FieldRow
            label={t("family.kids.kidBHasWaiver")}
            hint={t("family.kids.waiverHint")}
          >
            <Switch
              checked={family.kidBHasMedicaidWaiver}
              onCheckedChange={(v) => patch({ kidBHasMedicaidWaiver: v })}
              aria-label={t("family.kids.kidBHasWaiver")}
            />
          </FieldRow>
        </FormCard>

        <FormCard
          title={t("family.observance.title")}
          illustration={<InkCart className="h-16 w-16" />}
          className="md:col-span-2"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FieldRow label={t("family.observance.level")}>
              <Select
                value={family.observance}
                onValueChange={(v) => patch({ observance: v as typeof family.observance })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="secular">{t("family.observance.options.secular")}</SelectItem>
                  <SelectItem value="traditional">{t("family.observance.options.traditional")}</SelectItem>
                  <SelectItem value="shomerShabbat">{t("family.observance.options.shomerShabbat")}</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>

            <FieldRow label={t("family.observance.kosher")} hint={t("family.observance.kosherHint")}>
              <Switch
                checked={family.keepsKosher}
                onCheckedChange={(v) => patch({ keepsKosher: v })}
                aria-label={t("family.observance.kosher")}
              />
            </FieldRow>
          </div>
        </FormCard>
      </div>
    </TooltipProvider>
  );
}
