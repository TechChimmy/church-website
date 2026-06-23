import { createImageUrlBuilder } from '@sanity/image-url';

export function imageUrl(source: any) {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production';

  if (!projectId || projectId === 'REPLACE_ME') {
    throw new Error('Sanity Project ID is missing or set to "REPLACE_ME" in image URL builder.');
  }

  const builder = createImageUrlBuilder({
    projectId,
    dataset,
  });
  return builder.image(source);
}


