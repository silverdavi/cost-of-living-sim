import { locales } from "@/lib/i18n/config";
import { FamilyRedirect } from "./FamilyRedirect";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function FamilyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <FamilyRedirect locale={locale} />;
}
