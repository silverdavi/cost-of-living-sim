import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { isLocale, defaultLocale } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isLocale(requested) ? requested : defaultLocale;
  let messages;
  try {
    messages = (await import(`../../data/i18n/${locale}.json`)).default;
  } catch {
    notFound();
  }
  return { locale, messages };
});
