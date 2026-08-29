import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: true, type: "module" },
      // No static `manifest` here on purpose — each gallery lives at its own
      // /g/:slug and needs its own name/start_url/icon-scope, so the guest
      // app builds and injects a manifest per session at runtime instead
      // (see src/lib/dynamicManifest.js). This plugin still handles the
      // service worker, precaching, and runtime caching below.
      manifest: false,
      includeAssets: ["assets/jn-logo.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png"],
      workbox: {
        navigateFallbackDenylist: [/^\/api\//, /^\/ws/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/guest/photos/"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "guest-photo-files",
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            // Session info + gallery listing: last-known state renders
            // offline (network-first, short timeout) — a guest who already
            // opened the gallery once can keep browsing/downloading with
            // spotty venue signal.
            urlPattern: ({ url }) => url.pathname.startsWith("/api/guest/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "guest-api-data",
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
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
  // `vite preview` doesn't inherit `server.proxy` — needs its own.
  preview: {
    proxy: {
      "/api": "http://localhost:4000",
      "/ws": { target: "ws://localhost:4000", ws: true },
    },
  },
});
