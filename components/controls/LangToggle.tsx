"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { locales, type Locale } from "@/lib/i18n/config";

function swapLocaleInPath(pathname: string, next: Locale): string {
  const parts = pathname.split("/");
  if (parts.length > 1 && locales.includes(parts[1] as Locale)) {
    parts[1] = next;
    return parts.join("/") || "/";
  }
  return `/${next}${pathname}`;
}

export function LangToggle() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const go = (next: Locale) => {
    if (next === locale) return;
    router.push(swapLocaleInPath(pathname, next));
  };
  return (
    <div
      role="radiogroup"
      aria-label="Language"
      className="inline-flex items-center gap-1 rounded-xl border border-line bg-white/70 p-1 shadow-soft"
    >
      <button
        role="radio"
        aria-checked={locale === "he"}
        onClick={() => go("he")}
        className={cn(
          "flex h-7 min-w-[2rem] items-center justify-center rounded-lg px-2 text-xs font-semibold tracking-wide transition-all",
          locale === "he"
            ? "bg-accent text-white shadow-soft"
            : "text-ink/70 hover:bg-surface2"
        )}
        title="עברית"
        lang="he"
      >
        עב
      </button>
      <button
        role="radio"
        aria-checked={locale === "en"}
        onClick={() => go("en")}
        className={cn(
          "flex h-7 min-w-[2rem] items-center justify-center rounded-lg px-2 text-xs font-semibold tracking-wide transition-all",
          locale === "en"
            ? "bg-accent text-white shadow-soft"
            : "text-ink/70 hover:bg-surface2"
        )}
        title="English"
        lang="en"
      >
        EN
      </button>
    </div>
  );
}
