"use client";

import { useRef } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useSimStore } from "@/lib/store/useSimStore";
import { useTranslations } from "next-intl";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { MoreHorizontal, Download, Upload, RotateCcw, Link2, Printer } from "lucide-react";

export function ProfileMenu() {
  const exportJson = useSimStore((s) => s.exportJson);
  const importJson = useSimStore((s) => s.importJson);
  const exportShareHash = useSimStore((s) => s.exportShareHash);
  const reset = useSimStore((s) => s.reset);
  const t = useTranslations("actions");
  const locale = useLocale();
  const fileRef = useRef<HTMLInputElement>(null);

  const onExport = () => {
    const data = exportJson();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cost_simulator_state.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onCopyShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}${exportShareHash()}`;
    await navigator.clipboard.writeText(url);
  };

  const onImportClick = () => fileRef.current?.click();

  const onImportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const raw = JSON.parse(await file.text());
      importJson(raw);
    } catch {
      // swallow for now; a real toast would go here
    } finally {
      e.target.value = "";
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white/70 text-ink hover:bg-surface2"
          aria-label="profile menu"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60 p-2">
        <button
          onClick={onCopyShare}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface"
        >
          <Link2 className="h-4 w-4" /> {t("copyShare")}
        </button>
        <Link
          href={`/${locale}/report`}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface"
        >
          <Printer className="h-4 w-4" /> {t("printReport")}
        </Link>
        <div className="divider" />
        <button
          onClick={onExport}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface"
        >
          <Download className="h-4 w-4" /> {t("export")}
        </button>
        <button
          onClick={onImportClick}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface"
        >
          <Upload className="h-4 w-4" /> {t("import")}
        </button>
        <div className="divider" />
        <button
          onClick={reset}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-bad hover:bg-surface"
        >
          <RotateCcw className="h-4 w-4" /> {t("reset")}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={onImportChange}
        />
      </PopoverContent>
    </Popover>
  );
}
