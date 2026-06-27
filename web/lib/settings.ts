// lib/settings.ts
// Server-side helper — reads settings from Sanity.

import { fetchSiteSettingsFlat } from "./sanity-queries";

/** Returns all settings as a flat key→value map. */
export async function getAllSettings(): Promise<Record<string, string>> {
  try {
    const rows = await fetchSiteSettingsFlat();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {
    return {};
  }
}

/** Returns a single setting value (or fallback if not found). */
export async function getSetting(
  key: string,
  fallback = ""
): Promise<string> {
  try {
    const rows = await fetchSiteSettingsFlat();
    return rows.find((r) => r.key === key)?.value ?? fallback;
  } catch {
    return fallback;
  }
}

