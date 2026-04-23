"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "lifestyle", key: "setup" },
  { href: "results", key: "results" },
] as const;

export function TabNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav");
  return (
    <nav className="flex items-center gap-1 rounded-xl border border-line bg-white/70 p-1 shadow-soft">
      {tabs.map((tab) => {
        const href = `/${locale}/${tab.href}`;
        const normalized = pathname.replace(/\/$/, "");
        const active = normalized === href;
        return (
          <Link
            key={tab.href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "px-3 h-8 rounded-lg text-sm font-medium flex items-center transition-all",
              active
                ? "bg-accent/15 text-accent-deep ring-1 ring-accent/30"
                : "text-ink/70 hover:bg-surface2 hover:text-ink"
            )}
          >
            {t(tab.key)}
          </Link>
        );
      })}
    </nav>
  );
}
