"use client";

import { useState } from "react";
import { useSimStore } from "@/lib/store/useSimStore";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";

export function CurrencyToggle() {
  const currency = useSimStore((s) => s.settings.currency);
  const setCurrency = useSimStore((s) => s.setCurrency);
  const fx = useSimStore((s) => s.settings.fx);
  const setFxRate = useSimStore((s) => s.setFxRate);
  const t = useTranslations("currency");

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(fx.usdToIls));
  const [loading, setLoading] = useState(false);

  const applyManual = () => {
    const n = parseFloat(draft);
    if (!Number.isFinite(n) || n <= 0) return;
    setFxRate(n, "manual", "manual", new Date().toISOString().slice(0, 10));
    setEditing(false);
  };

  const toggleAuto = async (checked: boolean) => {
    if (!checked) {
      setFxRate(fx.usdToIls, "manual", "manual");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("https://api.frankfurter.app/latest?from=USD&to=ILS", {
        cache: "no-store",
      });
      const j = (await r.json()) as { rates?: { ILS?: number }; date?: string };
      const rate = j?.rates?.ILS;
      if (typeof rate === "number" && Number.isFinite(rate)) {
        setFxRate(
          Math.round(rate * 1000) / 1000,
          "auto",
          "frankfurter.app",
          j.date ?? new Date().toISOString().slice(0, 10)
        );
        setDraft(String(rate));
      }
    } catch {
      // keep manual rate; user will see unchanged values
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-line bg-white/70 p-1 shadow-soft">
      <div role="radiogroup" aria-label="Currency" className="flex gap-1">
        <button
          role="radio"
          aria-checked={currency === "ILS"}
          onClick={() => setCurrency("ILS")}
          className={cn(
            "flex h-7 min-w-[2.5rem] items-center justify-center rounded-lg px-2 text-xs font-semibold transition-all",
            currency === "ILS"
              ? "bg-accent2 text-ink shadow-soft"
              : "text-ink/70 hover:bg-surface2"
          )}
          title="₪ ILS"
          aria-label="ILS"
        >
          <span className="me-0.5 text-sm leading-none">₪</span>
          <span className="text-[11px] tracking-wide">ILS</span>
        </button>
        <button
          role="radio"
          aria-checked={currency === "USD"}
          onClick={() => setCurrency("USD")}
          className={cn(
            "flex h-7 min-w-[2.5rem] items-center justify-center rounded-lg px-2 text-xs font-semibold transition-all",
            currency === "USD"
              ? "bg-accent2 text-ink shadow-soft"
              : "text-ink/70 hover:bg-surface2"
          )}
          title="$ USD"
          aria-label="USD"
        >
          <span className="me-0.5 text-sm leading-none">$</span>
          <span className="text-[11px] tracking-wide">USD</span>
        </button>
      </div>
      <Popover open={editing} onOpenChange={setEditing}>
        <PopoverTrigger asChild>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-surface2"
            title={t("edit")}
            aria-label={t("edit")}
          >
            <Settings2 className="h-3.5 w-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72">
          <div className="space-y-3">
            <div className="text-sm font-medium text-ink">
              {t("rateLabel", { rate: fx.usdToIls.toFixed(2) })}
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="fx-auto" className="text-xs">{t("auto")}</Label>
              <Switch
                id="fx-auto"
                checked={fx.mode === "auto"}
                onCheckedChange={toggleAuto}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fx-manual" className="text-xs">{t("manual")}</Label>
              <div className="flex gap-2">
                <Input
                  id="fx-manual"
                  inputMode="decimal"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <Button size="sm" onClick={applyManual} variant="primary">OK</Button>
              </div>
            </div>
            <div className="hint">
              {t("rateSource", { source: fx.source })} · {t("asOf", { date: fx.asOf })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
