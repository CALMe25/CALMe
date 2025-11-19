import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { cloudflare } from "@cloudflare/vite-plugin";
import { fileURLToPath } from "url"; // Import fileURLToPath
import { dirname, resolve } from "path"; // Import dirname and resolve from path

// Get the directory name of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    cloudflare(),
    react(),
    tailwindcss(),
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/paraglide",
      strategy: ["localStorage", "preferredLanguage", "baseLocale"],
    }),
  ],
  resolve: {
    alias: {
      // Use resolve from 'path' and the correctly defined __dirname
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Lucide icons
            if (id.includes("/node_modules/lucide-react/")) {
              return "vendor-icons";
            }
            // Recharts and D3 - standalone charting
            if (
              id.includes("/node_modules/recharts/") ||
              id.includes("/node_modules/d3-")
            ) {
              return "vendor-charts";
            }
            // NLP libraries - compromise and its dependencies must stay together
            if (
              id.includes("/node_modules/compromise/") ||
              id.includes("/node_modules/efrt/") ||
              id.includes("/node_modules/grad-school/") ||
              id.includes("/node_modules/suffix-thumb/")
            ) {
              return "vendor-nlp";
            }
            // Sentiment analysis
            if (id.includes("/node_modules/sentiment/")) {
              return "vendor-sentiment";
            }
            // React core ecosystem + Radix UI - must stay together
            // Radix depends on React internals and breaks if separated
            if (
              id.includes("/node_modules/react-dom/") ||
              id.includes("/node_modules/scheduler/") ||
              id.includes("/node_modules/react/") ||
              id.includes("/node_modules/@radix-ui/")
            ) {
              return "vendor-react";
            }
            // Form and UI utilities
            if (
              id.includes("/node_modules/react-hook-form/") ||
              id.includes("/node_modules/clsx/") ||
              id.includes("/node_modules/class-variance-authority/") ||
              id.includes("/node_modules/tailwind-merge/") ||
              id.includes("/node_modules/sonner/") ||
              id.includes("/node_modules/next-themes/") ||
              id.includes("/node_modules/cmdk/") ||
              id.includes("/node_modules/embla-carousel/") ||
              id.includes("/node_modules/input-otp/") ||
              id.includes("/node_modules/react-day-picker/") ||
              id.includes("/node_modules/react-resizable-panels/") ||
              id.includes("/node_modules/vaul/") ||
              id.includes("/node_modules/tw-animate-css/")
            ) {
              return "vendor-utils";
            }
          }
        },
      },
    },
  },
});
