// Helpers for the multilingual (EN / RU / KZ) admin edit forms.

export type Lang = "en" | "ru" | "kk";

export const EDIT_LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
  { code: "kk", label: "KZ" },
];

/** Map an i18next language code to one of the three supported editing languages. */
export function resolveLang(language?: string): Lang {
  return language?.startsWith("ru") ? "ru" : language?.startsWith("kk") ? "kk" : "en";
}

/** Field name for a translatable base in a given language ("name" → "name"/"name_ru"/"name_kk"). */
export const fieldKey = (base: string, lang: Lang) => (lang === "en" ? base : `${base}_${lang}`);

/** Read the value of a translatable field from an object, in a given language. */
export const mlGet = (obj: Record<string, unknown>, base: string, lang: Lang) =>
  String(obj[fieldKey(base, lang)] ?? "");

/** Read with English fallback — for display when a translation is empty. */
export const mlView = (obj: Record<string, unknown>, base: string, lang: Lang) =>
  mlGet(obj, base, lang) || String(obj[base] ?? "");
