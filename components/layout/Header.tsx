"use client";

import { useTranslations } from "next-intl";
import { LangToggle } from "@/components/controls/LangToggle";
import { CurrencyToggle } from "@/components/controls/CurrencyToggle";
import { TabNav } from "./TabNav";
import { AssumptionsDrawer } from "./AssumptionsDrawer";
import { ProfileMenu } from "./ProfileMenu";
import { Logo } from "./Logo";

export function Header() {
  const t = useTranslations("app");
  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-bg/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-accent-deep">
          <Logo className="h-8 w-8" />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-ink">{t("title")}</div>
          </div>
        </div>
        <div className="ms-auto flex items-center gap-2 flex-wrap">
          <TabNav />
          <div className="v-divider hidden md:block" />
          <LangToggle />
          <CurrencyToggle />
          <ProfileMenu />
          <AssumptionsDrawer />
        </div>
      </div>
    </header>
  );
}
