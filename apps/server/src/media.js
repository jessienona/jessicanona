import fs from "node:fs/promises";
import { applyWatermark } from "./watermark.js";

const VARIANT_PATH = { original: "originalPath", preview: "previewPath", thumb: "thumbPath" };

/**
 * Streams a photo variant, burning in the session's watermark when the
 * request is guest-facing and the session's watermark policy calls for it:
 *   - "previews": guest preview/thumb are marked, downloads (variant=original) are clean
 *   - "all": everything guests can fetch is marked, including downloads
 *   - "never": nothing is marked
 * The photographer-facing routes always pass forGuest:false and get clean files.
 */
export async function sendPhotoVariant(res, { photo, session, variant, forGuest }) {
  const field = VARIANT_PATH[variant] ?? VARIANT_PATH.preview;
  const filePath = photo[field] || photo.originalPath;
  const buffer = await fs.readFile(filePath);

  const shouldMark =
    forGuest &&
    session.watermark.mode !== "never" &&
    (session.watermark.mode === "all" || variant !== "original");

  res.type("image/jpeg");
  if (!shouldMark) {
    res.send(buffer);
    return;
  }
  const marked = await applyWatermark(buffer, session.watermark.opacity / 100);
  res.send(marked);
}
