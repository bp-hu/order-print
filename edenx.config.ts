import { SemiRspackPlugin } from "@douyinfe/semi-rspack-plugin";
import { appTools, defineConfig } from "@edenx/app-tools";
import { PORT } from "./eden.proxy";

// https://edenx.bytedance.net/configure/app/usage
export default defineConfig({
  deploy: {
    autoRegion: true,
    handleDependencies: true,
  },
  devtools: false,
  dev: {
    hmr: process.env.NODE_ENV !== "production",
    port: PORT,
    client: { protocol: "ws", host: "localhost", port: `${PORT}` },
    startUrl: "http://120.48.87.222/",
  },
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
