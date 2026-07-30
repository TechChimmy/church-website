/**
 * Appends query parameters to Sanity image URLs to optimize them on Sanity CDN.
 * 
 * @param url The raw Sanity CDN image URL
 * @param width The target width for optimization
 * @returns The optimized URL with query parameters
 */
export function optimizeImageUrl(url: string | null | undefined, width = 1200): string {
  if (!url) return "";
  if (!url.includes("cdn.sanity.io")) return url;
  if (url.includes("?")) return url; // Already has query parameters
  return `${url}?w=${width}&q=75&fit=max&auto=format`;
}
