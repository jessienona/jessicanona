import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.join(__dirname, "..", "data");
export const INCOMING_DIR = path.join(DATA_DIR, "incoming");
export const PHOTOS_DIR = path.join(DATA_DIR, "photos");

for (const dir of [DATA_DIR, INCOMING_DIR, PHOTOS_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
}

export const db = new Database(path.join(DATA_DIR, "tether.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  event_date TEXT NOT NULL,
  delivery_mode TEXT NOT NULL DEFAULT 'hotspot',
  watermark_mode TEXT NOT NULL DEFAULT 'previews',
  watermark_opacity INTEGER NOT NULL DEFAULT 45,
  keep_raw INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'connect',
  camera_ip TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  started_at TEXT,
  ended_at TEXT
);

CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  seq INTEGER NOT NULL,
  filename TEXT NOT NULL,
  captured_at TEXT NOT NULL,
  lens TEXT, aperture TEXT, shutter TEXT, iso TEXT,
  width INTEGER, height INTEGER,
  status TEXT NOT NULL DEFAULT 'live',      -- live | pulled
  starred INTEGER NOT NULL DEFAULT 0,
  cull_state TEXT NOT NULL DEFAULT 'pending',-- pending | kept | pulled
  downloads INTEGER NOT NULL DEFAULT 0,
  embedding TEXT,                            -- JSON float array, computed client-side at ingest
  original_path TEXT NOT NULL,
  preview_path TEXT,
  thumb_path TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_photos_session ON photos(session_id);

CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_scans_session ON scans(session_id);

CREATE TABLE IF NOT EXISTS downloads (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  photo_id TEXT NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS cloud_queue (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  photo_id TEXT NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | uploaded | failed
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  uploaded_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_cloud_queue_status ON cloud_queue(session_id, status);
`);

export default db;
