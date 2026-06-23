import { defineCliConfig } from 'sanity/cli';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production';

if (!projectId || projectId === 'REPLACE_ME') {
  throw new Error('Sanity Project ID is missing or set to "REPLACE_ME" in CLI config.');
}

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
});
