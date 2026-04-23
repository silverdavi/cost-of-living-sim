"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Feasibility } from "@/lib/model/aggregate";

export function FeasibilityBadge({ status }: { status: Feasibility }) {
  const t = useTranslations("results.feasibility");
  const dot = {
    green: "bg-ok",
    yellow: "bg-warn",
    red: "bg-bad",
  }[status];
  const ring = {
    green: "ring-ok/30",
    yellow: "ring-warn/30",
    red: "ring-bad/30",
  }[status];
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "card-strong flex items-center gap-4 ring-2",
        ring
      )}
    >
      <span className={cn("inline-block h-3 w-3 rounded-full", dot)} />
      <p className="text-base font-medium leading-snug">{t(status)}</p>
    </motion.div>
  );
}
