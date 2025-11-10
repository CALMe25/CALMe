import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url"; // Import fileURLToPath
import { dirname, resolve } from "path"; // Import dirname and resolve from path

// Get the directory name of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Use resolve from 'path' and the correctly defined __dirname
      "@": resolve(__dirname, "./src"),
    },
  },
});
