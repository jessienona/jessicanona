import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import exifr from "exifr";
import { PHOTOS_DIR } from "./db.js";
import { Photos, Sessions, CloudQueue } from "./models.js";
import { hub } from "./ws.js";
import { WS_EVENTS } from "@tether/shared";

const THUMB_WIDTH = 480;
const PREVIEW_WIDTH = 1600;

/**
 * Ingest a single JPEG that just landed from the camera (via FTP, or any
 * other path — CCAPI's own transfer callback would call this too).
 * Generates a thumbnail + preview, reads EXIF, stores the record, and
 * broadcasts it live to connected apps.
 */
export async function ingestPhoto({ sessionId, sourcePath, filename }) {
  const session = Sessions.get(sessionId);
  if (!session) throw new Error(`ingestPhoto: unknown session ${sessionId}`);

  const sessionDir = path.join(PHOTOS_DIR, sessionId);
  await fs.mkdir(sessionDir, { recursive: true });

  const buffer = await fs.readFile(sourcePath);
  const exif = await exifr.parse(buffer, {
    pick: ["LensModel", "FNumber", "ExposureTime", "ISO", "DateTimeOriginal"],
  }).catch(() => null);

  const image = sharp(buffer);
  const meta = await image.metadata();

  const id = crypto.randomUUID();
  const originalPath = path.join(sessionDir, `${id}-original.jpg`);
  const previewPath = path.join(sessionDir, `${id}-preview.jpg`);
  const thumbPath = path.join(sessionDir, `${id}-thumb.jpg`);

  await Promise.all([
    fs.writeFile(originalPath, buffer),
    image.clone().resize({ width: PREVIEW_WIDTH, withoutEnlargement: true }).jpeg({ quality: 86 }).toFile(previewPath),
    image.clone().resize({ width: THUMB_WIDTH, withoutEnlargement: true }).jpeg({ quality: 78 }).toFile(thumbPath),
  ]);

  const photo = Photos.create({
    sessionId,
    filename,
    capturedAt: exif?.DateTimeOriginal?.toISOString?.() ?? new Date().toISOString(),
    lens: exif?.LensModel ?? null,
    aperture: exif?.FNumber ? `f/${exif.FNumber}` : null,
    shutter: exif?.ExposureTime ? shutterLabel(exif.ExposureTime) : null,
    iso: exif?.ISO ? String(exif.ISO) : null,
    width: meta.width,
    height: meta.height,
    originalPath,
    previewPath,
    thumbPath,
  });

  // Cloud mode uploads immediately; hotspot mode still queues so switching
  // mid-session (or losing signal) doesn't lose the backlog — see
  // "offline delivery: both, switched per session" in chats/chat1.md.
  CloudQueue.enqueue(sessionId, photo.id);

  hub.broadcast(sessionId, WS_EVENTS.PHOTO_ADDED, { photo });
  return photo;
}

function shutterLabel(seconds) {
  if (seconds >= 1) return `${seconds}s`;
  const denom = Math.round(1 / seconds);
  return `1/${denom}`;
}
