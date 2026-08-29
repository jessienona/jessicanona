// Design tokens ported 1:1 from the Claude Design prototype
// (project/Tether App.dc.html). Keep these in sync with the source of truth
// if the design changes — do not hand-tune colors independently per app.

export const fonts = {
  sans: `"Helvetica Neue", Helvetica, system-ui, sans-serif`,
  mono: `"IBM Plex Mono", monospace`,
  serif: `"Cormorant Garamond", serif`,
  googleFontsHref:
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=IBM+Plex+Mono:wght@400;500&display=swap",
};

export const dark = {
  shellBg: "#0B0B0C",
  cardBg: "#131315",
  ink: "#F2F0EC",
  inkDim: "rgba(242,240,236,.5)",
  inkFaint: "rgba(242,240,236,.4)",
  inkFainter: "rgba(242,240,236,.32)",
  hairline: "rgba(242,240,236,.09)",
  hairlineStrong: "rgba(242,240,236,.14)",
};

export const light = {
  shellBg: "#F4F1EC",
  ink: "#1A1918",
  inkDim: "rgba(26,25,24,.5)",
  inkFaint: "rgba(26,25,24,.42)",
  hairline: "rgba(26,25,24,.1)",
};

export const canvasBg = "#e8e5e0";

export const accent = {
  live: "oklch(0.74 0.15 62)",
  liveText: "oklch(0.8 0.13 62)",
  linked: "oklch(0.75 0.15 145)",
  danger: "oklch(0.62 0.16 25)",
  dangerText: "oklch(0.72 0.14 25)",
  success: "oklch(0.8 0.13 145)",
};

/** Warm placeholder hues used for photo-frame gradients before real crops exist. */
export const placeholderHues = [42, 58, 70, 86, 250];

export const radii = {
  sm: 6,
  md: 10,
  lg: 13,
  xl: 22,
};

export const phone = {
  width: 390,
  height: 844,
  outerRadius: 52,
  innerRadius: 44,
  bezel: 9,
};

/**
 * Content is capped and centered at these widths rather than stretching
 * edge-to-edge — the difference between a phone and an iPad in this app is
 * just "how wide is the column", not a separate layout. `wide` is for
 * grid-heavy screens (feed, gallery); `narrow` is everything else.
 */
export const layout = {
  narrow: 560,
  wide: 1040,
};

