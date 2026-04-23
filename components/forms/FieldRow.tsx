"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";

export function FieldRow({
  label,
  hint,
  children,
  valueBadge,
  caption,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  valueBadge?: React.ReactNode;
  caption?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Label>{label}</Label>
          {hint && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-muted hover:text-ink" aria-label="info">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">{hint}</TooltipContent>
            </Tooltip>
          )}
        </div>
        {valueBadge && <div>{valueBadge}</div>}
      </div>
      <div>{children}</div>
      {caption && <p className="hint">{caption}</p>}
    </div>
  );
}
