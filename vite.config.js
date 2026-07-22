import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const BASE = "/minibox/";

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: true },
      includeAssets: ["icons/apple-touch-icon.png"],
      manifest: {
        id: BASE,
        name: "Mini Box Andrérika",
        short_name: "Mini Box",
        description: "Sistema de gestão do Mini Box Andrérika — vendas, estoque, notinhas e clientes.",
        theme_color: "#3a2c0e",
        background_color: "#faf7f2",
        display: "standalone",
        orientation: "portrait",
        scope: BASE,
        start_url: BASE,
        lang: "pt-BR",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,woff2}"],
      },
    }),
  ],
});
