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
  <T>(
    query: string,
    params?: Record<string, unknown>,
    tags: string[] = [],
    useCdn: boolean = true
  ): Promise<T> => {
    const client = getSanityClient(useCdn);
    return client.fetch<T>(query, params as any, {
      next: {
        revalidate: useCdn ? 60 : 0,
        tags: ["sanity", ...tags],
      },
    });
  }
);
