// Home-screen icons for both apps. The source wordmark (project/assets/jn-logo.png)
// is a thin cursive script that doesn't read at 40-180px, so icons use a
// simple "JN" set in the same Cormorant Garamond serif the apps already
// load, on each app's theme background — legible small, on-brand large.
import sharp from "sharp";

function iconSvg(size, bg, fg) {
  const fontSize = Math.round(size * 0.42);
  return Buffer.from(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${bg}"/>
      <text x="50%" y="53%" text-anchor="middle" dominant-baseline="middle"
        font-family="Georgia, 'Cormorant Garamond', serif" font-weight="400"
        font-size="${fontSize}" letter-spacing="${Math.round(size * 0.02)}"
        fill="${fg}">JN</text>
    </svg>
  `);
}

async function makeIcon({ bg, fg, out, size }) {
  await sharp(iconSvg(size, bg, fg)).png().toFile(out);
  console.log("wrote", out);
}

const targets = [
  { app: "photographer", bg: "#0B0B0C", fg: "#F2F0EC" },
  { app: "guest", bg: "#F4F1EC", fg: "#1A1918" },
];

for (const t of targets) {
  const dir = `apps/${t.app}/public`;
  for (const size of [180, 192, 512]) {
    const name = size === 180 ? "apple-touch-icon.png" : `icon-${size}.png`;
    await makeIcon({ bg: t.bg, fg: t.fg, out: `${dir}/${name}`, size });
  }
}
