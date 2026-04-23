import { setRequestLocale, getTranslations } from "next-intl/server";
import { LifestyleForm } from "@/components/forms/LifestyleForm";

export default async function LifestylePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("lifestyle");
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted">{t("subtitle")}</p>
      </header>
      <LifestyleForm />
    </div>
  );
}
