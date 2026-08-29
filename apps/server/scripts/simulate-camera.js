// Simulates a Canon EOS camera pushing JPEGs over FTP, exactly the way a
// real one would once pointed at this server (Menu > Network settings >
// FTP transfer). Exercises the real FTP server + ingest pipeline end to
// end — nothing here talks to the ingest code directly.
import { Client } from "basic-ftp";
import sharp from "sharp";
import { Readable } from "node:stream";

const FTP_PORT = Number(process.env.FTP_PORT || 2121);
const FTP_HOST = process.env.FTP_HOST_CLIENT || "127.0.0.1";
const FTP_USER = process.env.FTP_USER || "r5";
const FTP_PASS = process.env.FTP_PASS || "tether";

const COUNT = Number(process.argv[2] || 5);
const INTERVAL_MS = Number(process.argv[3] || 1200);

const hueFor = (i) => [42, 58, 70, 86, 250][i % 5];

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: Math.round(255 * f(0)), g: Math.round(255 * f(8)), b: Math.round(255 * f(4)) };
}

// sharp/libvips only round-trips a small fixed set of EXIF tags — not
// arbitrary ones like LensModel/FNumber/ExposureTime/ISO — so simulated
// frames can't carry believable exposure data the way a real camera JPEG
// does. This script exists to prove the FTP → watch → ingest → DB path,
// not to fake shot metadata; ingest.js's exifr parse handles real camera
// EXIF fine, whatever body it came from.
async function makeFrame(i) {
  const { r, g, b } = hslToRgb(hueFor(i), 35, 45);
  return sharp({ create: { width: 4000, height: 6000, channels: 3, background: { r, g, b } } })
    .jpeg({ quality: 90 })
    .withMetadata({ exif: { IFD0: { Make: "Canon", Model: "Canon EOS Camera" } } })
    .toBuffer();
}

async function main() {
  console.log(`[simulate-camera] uploading ${COUNT} frame(s) to ftp://${FTP_HOST}:${FTP_PORT} every ${INTERVAL_MS}ms`);
  for (let i = 0; i < COUNT; i++) {
    const client = new Client();
    try {
      await client.access({ host: FTP_HOST, port: FTP_PORT, user: FTP_USER, password: FTP_PASS });
      const buffer = await makeFrame(i);
      const filename = `IMG_${String(4001 + i).padStart(4, "0")}.JPG`;
      await client.uploadFrom(Readable.from(buffer), filename);
      console.log(`[simulate-camera] uploaded ${filename} (${buffer.length.toLocaleString()} bytes)`);
    } catch (err) {
      console.error(`[simulate-camera] frame ${i} failed:`, err.message);
    } finally {
      client.close();
    }
    if (i < COUNT - 1) await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }
  console.log("[simulate-camera] done");
}

main();
