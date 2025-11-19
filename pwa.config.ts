import type { VitePWAOptions } from "vite-plugin-pwa";

export const pwaConfig: Partial<VitePWAOptions> = {
  registerType: "autoUpdate",
  includeAssets: ["favicon.svg", "vendor/**/*"],
  manifest: {
    name: "CALMe - Calm & Alert",
    short_name: "CALMe",
    description: "Your personal calm and alert companion",
    theme_color: "#0ea5e9",
    background_color: "#ffffff",
    display: "standalone",
    orientation: "portrait-primary",
    scope: "/",
    start_url: "/",
    icons: [
      {
        src: "/pwa-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  },
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,svg,woff,woff2}"],
  },
};
