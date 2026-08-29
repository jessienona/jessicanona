import sharp from "sharp";

const MARK_TEXT = "JESSICA NONA";

function markSvg(width, height, opacity) {
  const fontSize = Math.max(14, Math.round(width * 0.028));
  const padding = Math.round(width * 0.025);
  // Letter-spaced via explicit tspan gaps — SVG has no letter-spacing support
  // in every renderer sharp/libvips ships with, so we space characters by hand.
  const spaced = MARK_TEXT.split("").join("  ");
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text x="${width - padding}" y="${height - padding}" text-anchor="end"
        font-family="Georgia, 'Cormorant Garamond', serif" font-weight="300"
        font-size="${fontSize}" fill="#F2F0EC" fill-opacity="${opacity}">${spaced}</text>
    </svg>
  `);
}

/**
 * Burn a translucent wordmark into the bottom-right corner of an image.
 * Mirrors the guest-facing preview mark in the design (opacity is the
 * session's configured watermark opacity, 0-1).
 */
export async function applyWatermark(inputBuffer, opacity) {
  if (opacity <= 0) return inputBuffer;
  const img = sharp(inputBuffer);
  const meta = await img.metadata();
  const svg = markSvg(meta.width, meta.height, opacity);
  return img.composite([{ input: svg, gravity: "southeast" }]).toBuffer();
}
