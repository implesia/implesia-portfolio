import { cloudflare } from "@cloudflare/vite-plugin";
import { staticAssetsAdapter } from "@vinext/cloudflare/cache/static-assets-adapter";
import vinext from "vinext";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    // Every route is rendered at build time and shipped as a static asset, so a visit never
    // renders React inside the Worker. A new deploy replaces the whole cache.
    vinext({
      cache: { cdn: staticAssetsAdapter() },
      prerender: true,
    }),
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
    }),
  ],
});
