import { nanoid, customAlphabet } from "nanoid";
import db from "./db.js";

const slugAlphabet = "abcdefghjkmnpqrstuvwxyz23456789"; // no ambiguous chars
const slugId = customAlphabet(slugAlphabet, 8);

function rowToSession(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    eventDate: row.event_date,
    deliveryMode: row.delivery_mode,
    watermark: { mode: row.watermark_mode, opacity: row.watermark_opacity },
    keepRaw: !!row.keep_raw,
    status: row.status,
    cameraIp: row.camera_ip,
    createdAt: row.created_at,
    startedAt: row.started_at,
    endedAt: row.ended_at,
  };
}

function rowToPhoto(row) {
  if (!row) return null;
  return {
    id: row.id,
    sessionId: row.session_id,
    seq: row.seq,
    filename: row.filename,
    capturedAt: row.captured_at,
    exif: {
      lens: row.lens,
      aperture: row.aperture,
      shutter: row.shutter,
      iso: row.iso,
    },
    width: row.width,
    height: row.height,
    status: row.status,
    starred: !!row.starred,
    cullState: row.cull_state,
    downloads: row.downloads,
    hasEmbedding: !!row.embedding,
    embedding: row.embedding ? JSON.parse(row.embedding) : null,
    originalPath: row.original_path,
    previewPath: row.preview_path,
    thumbPath: row.thumb_path,
    createdAt: row.created_at,
  };
}

export const Sessions = {
  create({ name, eventDate, deliveryMode = "hotspot", cameraIp = null }) {
    const id = nanoid();
    let slug = slugId();
    // extremely unlikely collision, but guard anyway
    while (db.prepare("SELECT 1 FROM sessions WHERE slug = ?").get(slug)) {
      slug = slugId();
    }
    db.prepare(
      `INSERT INTO sessions (id, slug, name, event_date, delivery_mode, camera_ip)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, slug, name, eventDate, deliveryMode, cameraIp);
    return this.get(id);
  },
  get(id) {
    return rowToSession(db.prepare("SELECT * FROM sessions WHERE id = ?").get(id));
  },
  getBySlug(slug) {
    return rowToSession(db.prepare("SELECT * FROM sessions WHERE slug = ?").get(slug));
  },
  current() {
    // Single-photographer MVP: the most recently created non-ended session.
    return rowToSession(
      db
        .prepare("SELECT * FROM sessions WHERE ended_at IS NULL ORDER BY created_at DESC LIMIT 1")
        .get()
    );
  },
  start(id) {
    db.prepare(
      `UPDATE sessions SET status = 'feed', started_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?`
    ).run(id);
    return this.get(id);
  },
  end(id) {
    db.prepare(
      `UPDATE sessions SET status = 'ended', ended_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?`
    ).run(id);
    return this.get(id);
  },
  setDeliveryMode(id, mode) {
    db.prepare(`UPDATE sessions SET delivery_mode = ? WHERE id = ?`).run(mode, id);
    return this.get(id);
  },
  setWatermark(id, { mode, opacity }) {
    const cur = this.get(id);
    db.prepare(`UPDATE sessions SET watermark_mode = ?, watermark_opacity = ? WHERE id = ?`).run(
      mode ?? cur.watermark.mode,
      opacity ?? cur.watermark.opacity,
      id
    );
    return this.get(id);
  },
  setKeepRaw(id, keepRaw) {
    db.prepare(`UPDATE sessions SET keep_raw = ? WHERE id = ?`).run(keepRaw ? 1 : 0, id);
    return this.get(id);
  },
  setCameraIp(id, ip) {
    db.prepare(`UPDATE sessions SET camera_ip = ? WHERE id = ?`).run(ip, id);
    return this.get(id);
  },
  update(id, { name, eventDate, cameraIp }) {
    const cur = this.get(id);
    if (!cur) return null;
    db.prepare(`UPDATE sessions SET name = ?, event_date = ?, camera_ip = ? WHERE id = ?`).run(
      name ?? cur.name,
      eventDate ?? cur.eventDate,
      cameraIp !== undefined ? cameraIp : cur.cameraIp,
      id
    );
    return this.get(id);
  },
};

export const Photos = {
  create({
    sessionId,
    filename,
    capturedAt,
    lens,
    aperture,
    shutter,
    iso,
    width,
    height,
    originalPath,
    previewPath,
    thumbPath,
  }) {
    const id = nanoid();
    const seq = (db
      .prepare("SELECT COALESCE(MAX(seq), 0) + 1 AS n FROM photos WHERE session_id = ?")
      .get(sessionId)).n;
    db.prepare(
      `INSERT INTO photos
        (id, session_id, seq, filename, captured_at, lens, aperture, shutter, iso, width, height, original_path, preview_path, thumb_path)
       VALUES (@id, @sessionId, @seq, @filename, @capturedAt, @lens, @aperture, @shutter, @iso, @width, @height, @originalPath, @previewPath, @thumbPath)`
    ).run({ id, seq, sessionId, filename, capturedAt, lens, aperture, shutter, iso, width, height, originalPath, previewPath, thumbPath });
    return this.get(id);
  },
  get(id) {
    return rowToPhoto(db.prepare("SELECT * FROM photos WHERE id = ?").get(id));
  },
  listBySession(sessionId, { onlyLive = false } = {}) {
    const rows = onlyLive
      ? db
          .prepare("SELECT * FROM photos WHERE session_id = ? AND status = 'live' ORDER BY seq DESC")
          .all(sessionId)
      : db.prepare("SELECT * FROM photos WHERE session_id = ? ORDER BY seq DESC").all(sessionId);
    return rows.map(rowToPhoto);
  },
  count(sessionId) {
    return db.prepare("SELECT COUNT(*) AS n FROM photos WHERE session_id = ?").get(sessionId).n;
  },
  setStatus(id, status) {
    db.prepare("UPDATE photos SET status = ? WHERE id = ?").run(status, id);
    return this.get(id);
  },
  setStarred(id, starred) {
    db.prepare("UPDATE photos SET starred = ? WHERE id = ?").run(starred ? 1 : 0, id);
    return this.get(id);
  },
  setCullState(id, cullState) {
    db.prepare("UPDATE photos SET cull_state = ? WHERE id = ?").run(cullState, id);
    if (cullState === "pulled") this.setStatus(id, "pulled");
    return this.get(id);
  },
  setEmbedding(id, embedding) {
    db.prepare("UPDATE photos SET embedding = ? WHERE id = ?").run(JSON.stringify(embedding), id);
    return this.get(id);
  },
  incrementDownloads(id) {
    db.prepare("UPDATE photos SET downloads = downloads + 1 WHERE id = ?").run(id);
    return this.get(id);
  },
  cullStats(sessionId) {
    const total = this.count(sessionId);
    const reviewed = db
      .prepare("SELECT COUNT(*) AS n FROM photos WHERE session_id = ? AND cull_state != 'pending'")
      .get(sessionId).n;
    return { reviewed, total };
  },
};

export const Scans = {
  record(sessionId) {
    db.prepare("INSERT INTO scans (id, session_id) VALUES (?, ?)").run(nanoid(), sessionId);
  },
  count(sessionId) {
    return db.prepare("SELECT COUNT(*) AS n FROM scans WHERE session_id = ?").get(sessionId).n;
  },
  perHour(sessionId, buckets = 9) {
    const rows = db
      .prepare("SELECT created_at FROM scans WHERE session_id = ?")
      .all(sessionId);
    const counts = new Array(buckets).fill(0);
    for (const r of rows) {
      const hour = new Date(r.created_at).getHours();
      counts[hour % buckets] += 1;
    }
    const max = Math.max(1, ...counts);
    return counts.map((c) => Math.round((c / max) * 100));
  },
};

export const Downloads = {
  record(sessionId, photoId) {
    db.prepare("INSERT INTO downloads (id, session_id, photo_id) VALUES (?, ?, ?)").run(
      nanoid(),
      sessionId,
      photoId
    );
    Photos.incrementDownloads(photoId);
  },
  count(sessionId) {
    return db.prepare("SELECT COUNT(*) AS n FROM downloads WHERE session_id = ?").get(sessionId).n;
  },
  mostDownloaded(sessionId) {
    return db
      .prepare(
        "SELECT * FROM photos WHERE session_id = ? ORDER BY downloads DESC, seq DESC LIMIT 1"
      )
      .get(sessionId);
  },
};

export const CloudQueue = {
  enqueue(sessionId, photoId) {
    db.prepare(
      "INSERT INTO cloud_queue (id, session_id, photo_id) VALUES (?, ?, ?)"
    ).run(nanoid(), sessionId, photoId);
  },
  pending(sessionId) {
    return db
      .prepare("SELECT * FROM cloud_queue WHERE session_id = ? AND status = 'pending'")
      .all(sessionId);
  },
  pendingCount(sessionId) {
    return db
      .prepare("SELECT COUNT(*) AS n FROM cloud_queue WHERE session_id = ? AND status = 'pending'")
      .get(sessionId).n;
  },
  markUploaded(id) {
    db.prepare(
      "UPDATE cloud_queue SET status = 'uploaded', uploaded_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?"
    ).run(id);
  },
  markFailed(id) {
    db.prepare(
      "UPDATE cloud_queue SET status = 'failed', attempts = attempts + 1 WHERE id = ?"
    ).run(id);
  },
  allPending() {
    return db.prepare("SELECT * FROM cloud_queue WHERE status = 'pending'").all();
  },
};
