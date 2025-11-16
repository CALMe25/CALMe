import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { fileURLToPath } from "url"; // Import fileURLToPath
import { dirname, resolve } from "path"; // Import dirname and resolve from path

// Get the directory name of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const paraglideRuntimePath = resolve(__dirname, "./src/paraglide");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
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
            if (id.includes("react")) {
              return "vendor-react";
            }
            if (id.includes("@inlang") || id.includes("paraglide")) {
              return "vendor-i18n";
            }
            if (id.includes("lucide-react") || id.includes("sonner")) {
              return "vendor-ui";
            }
            if (id.includes("compromise") || id.includes("sentiment")) {
              return "vendor-nlp";
            }
            return "vendor";
          }
          if (id.includes(paraglideRuntimePath)) {
            return "paraglide-runtime";
          }
        },
      },
    },
  },
});
