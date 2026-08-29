import { Router } from "express";
import { Sessions, Photos, Scans, Downloads } from "../models.js";
import { sendPhotoVariant } from "../media.js";
import { presence, clientKeyFor } from "../presence.js";
import { hub } from "../ws.js";
import { WS_EVENTS } from "@tether/shared";

export const guestRouter = Router();

function publicPhoto(photo) {
  return {
    id: photo.id,
    seq: photo.seq,
    capturedAt: photo.capturedAt,
    exif: photo.exif,
    width: photo.width,
    height: photo.height,
    starred: photo.starred,
    downloads: photo.downloads,
  };
}

function getSessionOr404(req, res) {
  const session = Sessions.getBySlug(req.params.slug);
  if (!session) {
    res.status(404).json({ error: "This link has expired or the session has ended." });
    return null;
  }
  presence.touch(session.id, clientKeyFor(req));
  return session;
}

guestRouter.get("/session/:slug", (req, res) => {
  const session = getSessionOr404(req, res);
  if (!session) return;
  res.json({
    session: {
      id: session.id, // not sensitive — just the WS subscription key, scoped read-only on this router
      slug: session.slug,
      name: session.name,
      eventDate: session.eventDate,
      deliveryMode: session.deliveryMode,
      watermark: session.watermark,
      photoCount: Photos.count(session.id),
    },
  });
});

guestRouter.post("/session/:slug/scan", (req, res) => {
  const session = getSessionOr404(req, res);
  if (!session) return;
  Scans.record(session.id);
  res.json({ ok: true });
});

guestRouter.get("/session/:slug/photos", (req, res) => {
  const session = getSessionOr404(req, res);
  if (!session) return;
  const photos = Photos.listBySession(session.id, { onlyLive: true }).map(publicPhoto);
  res.json({ photos });
});

// Only vectors leave the server here — never raw images or anything guest-
// identifying. The guest's own device does the comparison against its
// selfie; see apps/guest's face-match module and chats/chat1.md.
guestRouter.get("/session/:slug/embeddings", (req, res) => {
  const session = getSessionOr404(req, res);
  if (!session) return;
  const embeddings = Photos.listBySession(session.id, { onlyLive: true })
    .filter((p) => p.hasEmbedding)
    .map((p) => ({ photoId: p.id, embedding: p.embedding }));
  res.json({ embeddings });
});

guestRouter.get("/photos/:id/file", async (req, res) => {
  const photo = Photos.get(req.params.id);
  if (!photo || photo.status !== "live") return res.status(404).end();
  const session = Sessions.get(photo.sessionId);
  await sendPhotoVariant(res, {
    photo,
    session,
    variant: req.query.variant ?? "preview",
    forGuest: true,
  });
});

guestRouter.get("/photos/:id/download", async (req, res) => {
  const photo = Photos.get(req.params.id);
  if (!photo || photo.status !== "live") return res.status(404).end();
  const session = Sessions.get(photo.sessionId);
  Downloads.record(session.id, photo.id);
  hub.broadcast(session.id, WS_EVENTS.PHOTO_UPDATED, { photo: Photos.get(photo.id) });
  res.set("Content-Disposition", `attachment; filename="${photo.filename}"`);
  await sendPhotoVariant(res, { photo, session, variant: "original", forGuest: true });
});
