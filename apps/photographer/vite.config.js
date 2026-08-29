import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Also enable the SW/manifest during `vite dev` so installability and
      // offline behavior can actually be tested without a production build.
      devOptions: { enabled: true, type: "module" },
      includeAssets: ["assets/jn-logo.png"],
      manifest: {
        name: "Tether — Photographer",
        short_name: "Tether",
        description: "Live tethered capture, cull, and guest delivery for the R5.",
        start_url: "/connect",
        scope: "/",
        display: "standalone",
        orientation: "any",
        background_color: "#0B0B0C",
        theme_color: "#0B0B0C",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api\//, /^\/ws/],
        runtimeCaching: [
          {
            // Photo thumbnails/previews: rarely change once ingested — serve
            // cached instantly, refresh in the background.
            urlPattern: ({ url }) => url.pathname.startsWith("/api/photos/") && url.pathname.endsWith("/file"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "photo-files",
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            // Session/photo list/stats JSON: network-first so live data wins
            // when online, but the last-known state still renders offline —
            // matches the design's "offline ready" hotspot mode.
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-data",
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts" },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": "http://localhost:4000",
      "/ws": { target: "ws://localhost:4000", ws: true },
    },
  },
  // `vite preview` (serving the real production build + generated service
  // worker) doesn't inherit `server.proxy` — it needs its own, or `npm run
  // preview` can't reach the backend at all.
  preview: {
    proxy: {
      "/api": "http://localhost:4000",
      "/ws": { target: "ws://localhost:4000", ws: true },
    },
  },
});
