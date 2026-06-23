import { cache } from 'react';
import { getSanityClient } from './client';

export const sanityFetch = cache(<T>(query: string, params?: Record<string, unknown>): Promise<T> => {
  const client = getSanityClient(true);
  return client.fetch<T>(query, params as any, {
    next: { revalidate: 60 },
  });
});

// We will use raw HTTP mutations via client.request in API routes instead.
export async function sanityMutateRaw(mutations: any[]): Promise<any> {
  const client = getSanityClient();
  return client.request({
    url: '/mutate/production',
    method: 'POST',
    body: { mutations },
  } as any);
}



