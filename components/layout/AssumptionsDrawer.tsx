"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useSimStore } from "@/lib/store/useSimStore";
import { SlidersHorizontal, Info } from "lucide-react";

export function AssumptionsDrawer() {
  const t = useTranslations("assumptions");
  const [open, setOpen] = useState(false);
  const a = useSimStore((s) => s.settings.assumptions);
  const fx = useSimStore((s) => s.settings.fx);
  const patch = useSimStore((s) => s.patchAssumptions);
  const setFxRate = useSimStore((s) => s.setFxRate);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white/70 text-ink hover:bg-surface2"
          aria-label={t("title")}
          title={t("title")}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-lg font-semibold">{t("title")}</DialogTitle>
        <DialogDescription className="text-sm text-muted mb-6">
          {t("subtitle")}
        </DialogDescription>

        <TooltipProvider delayDuration={150}>
          <div className="space-y-6">
            <Row label={t("taxYear")}>
              <div className="chip">2025</div>
            </Row>

            <Row
              label={t("acaExtended")}
              hint={t("acaExtendedHint")}
            >
              <Switch
                checked={a.acaExtended}
                onCheckedChange={(v) => patch({ acaExtended: v })}
              />
            </Row>

            <Row label={t("kosherMultiplier")} hint={t("kosherMultiplierHint")}>
              <div className="flex items-center gap-3 w-full">
                <Slider
                  value={[a.kosherMultiplierOverride ?? 1.3]}
                  min={1.0}
                  max={1.8}
                  step={0.05}
                  onValueChange={(v) => patch({ kosherMultiplierOverride: v[0] })}
                  className="flex-1"
                />
                <div className="chip">{(a.kosherMultiplierOverride ?? 1.3).toFixed(2)}×</div>
              </div>
            </Row>

            <Row label={t("reserve")} hint={t("reserveHint")}>
              <div className="flex items-center gap-3 w-full">
                <Slider
                  value={[a.reserveMonthsForGreen]}
                  min={0}
                  max={6}
                  step={1}
                  onValueChange={(v) => patch({ reserveMonthsForGreen: v[0] })}
                  className="flex-1"
                />
                <div className="chip">{a.reserveMonthsForGreen} mo</div>
              </div>
            </Row>

            <div className="divider" />

            <Row label={t("fx")}>
              <div className="space-y-2 w-full">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={fx.usdToIls}
                    onChange={(e) => {
                      const n = parseFloat(e.target.value);
                      if (Number.isFinite(n) && n > 0)
                        setFxRate(n, "manual", "manual");
                    }}
                  />
                  <span className="chip">USD → ILS</span>
                </div>
                <div className="hint">{fx.source} · {fx.asOf}</div>
              </div>
            </Row>
          </div>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>{label}</Label>
        {hint && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted hover:text-ink">
                <Info className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{hint}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}
