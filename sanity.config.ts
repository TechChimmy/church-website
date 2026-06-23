import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { schemaTypes } from './sanity/schemaTypes';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production';

if (!projectId || projectId === 'REPLACE_ME') {
  throw new Error(
    'Sanity Project ID is missing or set to "REPLACE_ME". ' +
    'Please configure NEXT_PUBLIC_SANITY_PROJECT_ID in your .env file.'
  );
}

export default defineConfig({
  name: 'cft-church',
  title: 'Christian Fellowship Church CMS',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [deskTool()],
  schema: {
    types: schemaTypes,
  },
});


