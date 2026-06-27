import { cache } from "react";
import { getSanityClient } from "./client";

/**
 * Cached, ISR-aware Sanity query helper.
 *
 * - Wrapped in React `cache()` so identical queries during a single server
 *   render are deduplicated.
 * - Uses `{ next: { revalidate: 60 } }` so Next.js revalidates the data
 *   every 60 seconds (Incremental Static Regeneration).
 * - Always uses the CDN client (read-only, fast).
 */
export const sanityFetch = cache(
  <T>(query: string, params?: Record<string, unknown>): Promise<T> => {
    const client = getSanityClient(true);
    return client.fetch<T>(query, params as any, {
      next: { revalidate: 60 },
    });
  }
);
