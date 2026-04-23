export const locales = ["he", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "he";

export const localeLabels: Record<Locale, { native: string; english: string; dir: "rtl" | "ltr"; flag: string }> = {
  he: { native: "עברית", english: "Hebrew", dir: "rtl", flag: "il" },
  en: { native: "English", english: "English", dir: "ltr", flag: "us" },
};

export function isLocale(v: string | undefined): v is Locale {
  return v === "he" || v === "en";
}
