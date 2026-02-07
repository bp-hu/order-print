import { appTools, defineConfig } from '@edenx/app-tools';

// https://edenx.bytedance.net/configure/app/usage
export default defineConfig({
  deploy: {
    autoRegion: true,
    handleDependencies: true,
  },
  devtools: false,
  plugins: [appTools()],
  output: {
    distPath: {
      root: 'docs'
    }
  }
});
