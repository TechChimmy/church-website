import { createClient } from "next-sanity";

export type { SanityClient } from "next-sanity";

/**
 * Returns a configured Sanity client.
 *
 * - When `useCdnOverride` is `true`, the CDN is used (fast, cached, read-only).
 * - When a write token is present and `useCdnOverride` is not explicitly `true`,
 *   the CDN is disabled so mutations can go through.
 */
export function getSanityClient(useCdnOverride?: boolean) {
  const projectId =
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
  const dataset =
    process.env.NEXT_PUBLIC_SANITY_DATASET ||
    process.env.SANITY_DATASET ||
    "production";
  const apiVersion = process.env.SANITY_API_VERSION || "2024-01-01";
  const token =
    process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;

  if (!projectId || projectId === "REPLACE_ME") {
    throw new Error(
      'Sanity Project ID is missing or set to "REPLACE_ME". ' +
        "Set NEXT_PUBLIC_SANITY_PROJECT_ID in your .env file."
    );
  }

  const useCdn = useCdnOverride !== undefined ? useCdnOverride : !token;

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn,
    ...(useCdn ? {} : { token }),
  });
}
