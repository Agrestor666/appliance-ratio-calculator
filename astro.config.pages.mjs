/**
 * Static Cloudflare Pages build (*.pages.dev).
 *
 * Astro 6 SSR is not supported on Pages (Cloudflare Vite plugin / ASSETS binding).
 * This config prerenders the calculator UI. Auth API endpoints are omitted from the
 * route graph so we do not need to move folders on disk (Windows locks).
 */
import { defineConfig, envField } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

/** Drop /api/* endpoints from the static Pages build (no server runtime there). */
function omitApiRoutes() {
  return {
    name: "omit-api-routes-for-pages",
    hooks: {
      "astro:build:setup": ({ pages, logger }) => {
        for (const key of [...pages.keys()]) {
          const normalized = key.replaceAll("\\", "/");
          if (normalized.includes("/pages/api/") || normalized.includes("/api/")) {
            pages.delete(key);
            logger.info(`Pages build: omitting ${key}`);
          }
        }
      },
    },
  };
}

export default defineConfig({
  output: "static",
  integrations: [react(), sitemap(), omitApiRoutes()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ["react", "react-dom"],
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
  },
  env: {
    schema: {
      SUPABASE_URL: envField.string({ context: "server", access: "secret", optional: true }),
      SUPABASE_KEY: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },
});
