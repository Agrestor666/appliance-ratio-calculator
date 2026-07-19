// @ts-check
import { defineConfig, envField } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

/**
 * Pre-bundle React (+ island peers) for every non-client Vite environment.
 * Under @astrojs/cloudflare, `vite.ssr.optimizeDeps` is ignored — use configEnvironment.
 * Prevents lazy optimizer reloads that desync React's hook dispatcher (white screen /
 * "Invalid hook call" / useState on null) in Astro 6 + workerd dev.
 */
const SERVER_OPTIMIZE_DEPS = [
  "react",
  "react-dom",
  "react-dom/server.edge",
  "react-dom/client",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "chart.js",
  "lucide-react",
  "radix-ui",
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
];

function optimizeServerDeps() {
  return {
    name: "optimize-server-deps",
    /** @param {string} name */
    configEnvironment(name) {
      if (name !== "client") {
        return {
          optimizeDeps: {
            include: SERVER_OPTIMIZE_DEPS,
            exclude: ["@supabase/ssr"],
          },
        };
      }
    },
  };
}

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss(), optimizeServerDeps()],
    resolve: {
      dedupe: ["react", "react-dom"],
      // Dev runs in workerd — use Web Streams build everywhere.
      alias: {
        "react-dom/server": "react-dom/server.edge",
      },
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "chart.js",
        "lucide-react",
        "radix-ui",
        "class-variance-authority",
        "clsx",
        "tailwind-merge",
      ],
      exclude: ["@supabase/ssr"],
    },
    ssr: {
      optimizeDeps: {
        exclude: ["@supabase/ssr"],
      },
    },
  },
  adapter: cloudflare(),
  env: {
    schema: {
      SUPABASE_URL: envField.string({ context: "server", access: "secret", optional: true }),
      SUPABASE_KEY: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },
});
