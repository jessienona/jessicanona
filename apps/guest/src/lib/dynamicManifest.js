/**
 * Each gallery lives at its own /g/:slug — there's no single fixed "app" to
 * describe in a build-time manifest.webmanifest the way the photographer
 * app has. Instead, once a session loads we build a manifest scoped to
 * *this* gallery and swap it in as a Blob URL, so "Add to Home Screen" /
 * the Android install prompt saves a shortcut to this specific gallery
 * with its own name and icon, not a generic "Tether" shell.
 */
export function setGuestManifest(session) {
  const manifest = {
    name: `${session.name} — Tether Gallery`,
    short_name: session.name.length > 14 ? "Gallery" : session.name,
    start_url: `/g/${session.slug}`,
    scope: `/g/${session.slug}`,
    display: "standalone",
    orientation: "any",
    background_color: "#F4F1EC",
    theme_color: "#F4F1EC",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };

  const blob = new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" });
  const url = URL.createObjectURL(blob);

  let link = document.querySelector('link[rel="manifest"]');
  const prevUrl = link?.getAttribute("href");
  if (!link) {
    link = document.createElement("link");
    link.rel = "manifest";
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);

  // Free the previous Blob URL once the new one is safely attached.
  if (prevUrl?.startsWith("blob:")) URL.revokeObjectURL(prevUrl);
}
