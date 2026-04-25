import { setRequestLocale, getTranslations } from "next-intl/server";
import { ReportView } from "@/components/report/ReportView";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("report");
  return (
    <div className="space-y-6">
      <header className="no-print space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted">{t("subtitle")}</p>
      </header>
      <ReportView />
    </div>
  );
}
