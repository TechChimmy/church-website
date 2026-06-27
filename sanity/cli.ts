import { defineCliConfig } from 'sanity/cli';

const projectId = 'gkt4v4d6';
const dataset = 'production';

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
});


