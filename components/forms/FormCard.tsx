"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function FormCard({
  title,
  subtitle,
  illustration,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  illustration?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("card relative overflow-hidden", className)}>
      {illustration && (
        <div className="pointer-events-none absolute top-4 end-4 h-16 w-16 text-ink/70">
          {illustration}
        </div>
      )}
      <header className="mb-5 max-w-md">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="hint mt-1">{subtitle}</p>}
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
