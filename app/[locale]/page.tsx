import { locales } from "@/lib/i18n/config";
import { LocaleRedirect } from "./LocaleRedirect";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <LocaleRedirect locale={locale} />;
}
