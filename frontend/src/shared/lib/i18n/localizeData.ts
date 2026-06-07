/**
 * Backend localization helper.
 *
 * The API returns localized data via a `?language=` query param (added
 * automatically by the http client). Each translatable field comes back as a
 * pair: the raw source field (e.g. `name`, always English) plus a localized
 * variant (`name_localized`) computed for the requested language.
 *
 * `localizeData` walks a response and overwrites every base field with its
 * `*_localized` value (when present and non-empty), so UI components can keep
 * reading plain `name` / `local_name` / `description` etc. and get the right
 * language for free.
 *
 * IMPORTANT: apply this only to PUBLIC read responses. Admin edit forms need
 * the raw `name` / `name_ru` / `name_kk` fields untouched, so their fetches
 * must NOT pass through here.
 */
const SUFFIX = "_localized";

export function localizeData<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map((item) => localizeData(item)) as unknown as T;
  }

  if (data !== null && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const out: Record<string, unknown> = {};

    // Recurse into every value first.
    for (const [key, value] of Object.entries(obj)) {
      out[key] = localizeData(value);
    }

    // Then promote *_localized values onto their base field.
    for (const key of Object.keys(obj)) {
      if (key.endsWith(SUFFIX)) {
        const base = key.slice(0, -SUFFIX.length);
        const localized = out[key];
        if (localized !== null && localized !== undefined && localized !== "") {
          out[base] = localized;
        }
      }
    }

    return out as T;
  }

  return data;
}
