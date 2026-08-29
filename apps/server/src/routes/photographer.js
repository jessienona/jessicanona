import { Router } from "express";
import { Sessions, Photos, Scans, Downloads, CloudQueue } from "../models.js";
import { ccapiMonitor } from "../ccapi.js";
import { sessionQr } from "../qr.js";
import { sendPhotoVariant } from "../media.js";
import { hub } from "../ws.js";
import { presence } from "../presence.js";
import { WS_EVENTS } from "@tether/shared";

export const photographerRouter = Router();

function todayLabel() {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" }).replace(",", "");
}

// The connect screen always has *something* to show — create a draft
// session on first load rather than forcing a separate "new session" step.
photographerRouter.get("/session/current", (req, res) => {
  let session = Sessions.current();
  if (!session) {
    session = Sessions.create({ name: `New session — ${todayLabel()}`, eventDate: todayLabel() });
  }
  res.json({ session });
});

photographerRouter.patch("/session/:id", (req, res) => {
  const session = Sessions.update(req.params.id, req.body);
  if (!session) return res.status(404).json({ error: "not found" });
  hub.broadcast(session.id, WS_EVENTS.SESSION_UPDATED, { session });
  res.json({ session });
});

photographerRouter.patch("/session/:id/delivery", (req, res) => {
  const session = Sessions.setDeliveryMode(req.params.id, req.body.mode);
  hub.broadcast(session.id, WS_EVENTS.SESSION_UPDATED, { session });
  res.json({ session });
});

photographerRouter.patch("/session/:id/watermark", (req, res) => {
  const session = Sessions.setWatermark(req.params.id, req.body);
  hub.broadcast(session.id, WS_EVENTS.SESSION_UPDATED, { session });
  res.json({ session });
});

photographerRouter.patch("/session/:id/keep-raw", (req, res) => {
  const session = Sessions.setKeepRaw(req.params.id, req.body.keepRaw);
  res.json({ session });
});

photographerRouter.post("/session/:id/start", (req, res) => {
  const session = Sessions.start(req.params.id);
  if (session.cameraIp) ccapiMonitor.start(session.id, session.cameraIp);
  hub.broadcast(session.id, WS_EVENTS.SESSION_UPDATED, { session });
  res.json({ session });
});

photographerRouter.post("/session/:id/end", (req, res) => {
  ccapiMonitor.stop(req.params.id);
  const session = Sessions.end(req.params.id);
  res.json({ session });
});

photographerRouter.get("/session/:id/camera-status", (req, res) => {
  res.json({ state: ccapiMonitor.getState(req.params.id), info: ccapiMonitor.getInfo(req.params.id) });
});

photographerRouter.get("/session/:id/qr", async (req, res) => {
  const session = Sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: "not found" });
  res.json(await sessionQr(session));
});

photographerRouter.get("/session/:id/stats", (req, res) => {
  const id = req.params.id;
  const mostDownloaded = Downloads.mostDownloaded(id);
  res.json({
    scans: Scans.count(id),
    downloads: Downloads.count(id),
    scansPerHour: Scans.perHour(id),
    mostDownloaded: mostDownloaded ? { filename: mostDownloaded.filename, downloads: mostDownloaded.downloads } : null,
    queued: CloudQueue.pendingCount(id),
    cull: Photos.cullStats(id),
    devicesOnHotspot: presence.count(id),
  });
});

photographerRouter.get("/session/:id/photos", (req, res) => {
  res.json({ photos: Photos.listBySession(req.params.id) });
});

photographerRouter.get("/photos/:id", (req, res) => {
  const photo = Photos.get(req.params.id);
  if (!photo) return res.status(404).json({ error: "not found" });
  res.json({ photo });
});

photographerRouter.get("/photos/:id/file", async (req, res) => {
  const photo = Photos.get(req.params.id);
  if (!photo) return res.status(404).end();
  const session = Sessions.get(photo.sessionId);
  await sendPhotoVariant(res, { photo, session, variant: req.query.variant ?? "preview", forGuest: false });
});

photographerRouter.post("/photos/:id/pull", (req, res) => {
  const photo = Photos.setStatus(req.params.id, "pulled");
  hub.broadcast(photo.sessionId, WS_EVENTS.PHOTO_UPDATED, { photo });
  res.json({ photo });
});

photographerRouter.post("/photos/:id/restore", (req, res) => {
  const photo = Photos.setStatus(req.params.id, "live");
  hub.broadcast(photo.sessionId, WS_EVENTS.PHOTO_UPDATED, { photo });
  res.json({ photo });
});

photographerRouter.patch("/photos/:id/star", (req, res) => {
  const photo = Photos.setStarred(req.params.id, req.body.starred);
  res.json({ photo });
});

photographerRouter.post("/photos/:id/cull", (req, res) => {
  const action = req.body.action === "pull" ? "pulled" : "kept";
  const photo = Photos.setCullState(req.params.id, action);
  hub.broadcast(photo.sessionId, WS_EVENTS.PHOTO_UPDATED, { photo });
  res.json({ photo, cull: Photos.cullStats(photo.sessionId) });
});

// The photographer app runs face-api.js in a hidden canvas on new photos and
// posts the resulting descriptor back here — the server never runs face
// recognition itself, matching the "matching happens on your phone" claim.
photographerRouter.patch("/photos/:id/embedding", (req, res) => {
  const photo = Photos.setEmbedding(req.params.id, req.body.embedding);
  res.json({ photo });
});
