import { SemiRspackPlugin } from "@douyinfe/semi-rspack-plugin";
import { appTools, defineConfig } from "@edenx/app-tools";

// https://edenx.bytedance.net/configure/app/usage
export default defineConfig({
  deploy: {
    autoRegion: true,
    handleDependencies: true,
  },
  devtools: false,
  plugins: [
    appTools({
      bundler: "rspack",
    }),
  ],
  tools: {
    rspack(config) {
      config.plugins = config.plugins || [];
      config.plugins.push(
        new SemiRspackPlugin({
          cssLayer: true,
        }) as any,
      );
    },
  },
});
