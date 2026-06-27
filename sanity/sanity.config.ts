import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { schemaTypes } from './schemaTypes';

const projectId = 'gkt4v4d6';
const dataset = 'production';

export default defineConfig({
  name: 'cft-church',
  title: 'Christian Fellowship Church CMS',
  projectId,
  dataset,
  plugins: [deskTool()],
  schema: {
    types: schemaTypes,
  },
});
