import { defineCliConfig } from 'sanity/cli';

const projectId = 'gkt4v4d6';
const dataset = 'production';

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  studioHost: 'cft-church-cms',
  vite(viteConfig) {
    return {
      ...viteConfig,
      server: {
        ...viteConfig.server,
        host: '127.0.0.1',
        hmr: {
          clientPort: 3333,
          host: '127.0.0.1',
        },
      },
    };
  },
});


