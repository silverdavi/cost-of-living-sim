"use client";

import { useTranslations } from "next-intl";
import { useSimStore } from "@/lib/store/useSimStore";
import { FormCard } from "./FormCard";
import { FieldRow } from "./FieldRow";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InkFamily } from "@/components/illustrations/InkFamily";
import { InkCart } from "@/components/illustrations/InkCart";
import { getCity } from "@/lib/data/loaders";

export function FamilyForm() {
  const t = useTranslations();
  const family = useSimStore((s) => s.profile.family);
  const citySlug = useSimStore((s) => s.profile.lifestyle.city);
  const patch = useSimStore((s) => s.patchFamily);

  const cityKosherMult = (() => {
    try { return getCity(citySlug).food.kosherMultiplier; }
    catch { return 1.3; }
  })();

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
          title={t("family.food.title")}
          subtitle={t("family.food.subtitle")}
          illustration={<InkCart className="h-16 w-16" />}
          className="md:col-span-2"
        >
          <FieldRow
            label={t("family.food.multiplier")}
            hint={t("family.food.multiplierHint")}
            valueBadge={<div className="chip">×{family.foodMultiplier.toFixed(2)}</div>}
            caption={t("family.food.caption", {
              cityMult: cityKosherMult.toFixed(2),
            })}
          >
            <div className="flex items-center gap-3">
              <Slider
                value={[family.foodMultiplier]}
                min={0.8}
                max={2.0}
                step={0.05}
                onValueChange={(v) => patch({ foodMultiplier: Number(v[0].toFixed(2)) })}
                className="flex-1"
              />
              <Button
                size="sm"
                variant="subtle"
                title={t("family.food.resetCity")}
                onClick={() => patch({ foodMultiplier: cityKosherMult })}
              >
                ×{cityKosherMult.toFixed(2)}
              </Button>
              <Button
                size="sm"
                variant="subtle"
                title={t("family.food.resetPlain")}
                onClick={() => patch({ foodMultiplier: 1.0 })}
              >
                ×1.00
              </Button>
            </div>
          </FieldRow>
        </FormCard>
      </div>
    </TooltipProvider>
  );
}
