// lib/settings.ts
// Server-side helper — reads SiteSetting records from Prisma.

import { prisma } from "./prisma";

/** Returns all settings as a flat key→value map. */
export async function getAllSettings(): Promise<Record<string, string>> {
  try {
    const rows = await prisma.siteSetting.findMany();
    return Object.fromEntries(rows.map((r: { key: string; value: string }) => [r.key, r.value]));
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
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    return row?.value ?? fallback;
  } catch {
    return fallback;
  }
}
