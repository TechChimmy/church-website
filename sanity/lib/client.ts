import { createClient } from '@sanity/client';

export type SanityClient = ReturnType<typeof createClient>;

export function getSanityClient(useCdnOverride?: boolean) {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production';
  const apiVersion = process.env.SANITY_API_VERSION || '2024-01-01';
  const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;

  if (!projectId || projectId === 'REPLACE_ME') {
    throw new Error('Sanity Project ID is missing or set to "REPLACE_ME" in Sanity client.');
  }

  const useCdn = useCdnOverride !== undefined ? useCdnOverride : !token;

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn,
    token,
  });
}


