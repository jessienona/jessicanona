import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { INCOMING_DIR } from "./db.js";
import { Sessions } from "./models.js";
import { ingestPhoto } from "./ingest.js";

const JPEG_RE = /\.(jpe?g)$/i;
const STABLE_CHECK_MS = 350;
const inFlight = new Set();

async function isStable(filePath) {
  try {
    const a = await fsp.stat(filePath);
    await new Promise((r) => setTimeout(r, STABLE_CHECK_MS));
    const b = await fsp.stat(filePath);
    return a.size === b.size && a.size > 0;
  } catch {
    return false; // file vanished mid-check
  }
}

async function handleNewFile(filename) {
  if (!JPEG_RE.test(filename) || inFlight.has(filename)) return;
  const filePath = path.join(INCOMING_DIR, filename);
  inFlight.add(filename);
  try {
    if (!(await isStable(filePath))) return; // still being written; a later event will catch it
    const session = Sessions.current();
    if (!session) {
      console.warn(`[watch] ${filename} arrived with no active session — leaving in incoming/`);
      return;
    }
    await ingestPhoto({ sessionId: session.id, sourcePath: filePath, filename });
    await fsp.unlink(filePath);
    console.log(`[watch] ingested ${filename} into session ${session.slug}`);
  } catch (err) {
    console.error(`[watch] failed to ingest ${filename}:`, err.message);
  } finally {
    inFlight.delete(filename);
  }
}

/**
 * Watches data/incoming for new JPEGs — the drop point for both the FTP
 * server (ftpServer.js) and the simulate-camera script. Real FTP transfer
 * from any supported Canon EOS body lands files here the same way.
 */
export function startIncomingWatcher() {
  fs.mkdirSync(INCOMING_DIR, { recursive: true });
  // Catch anything already sitting there (e.g. server restarted mid-transfer).
  fsp.readdir(INCOMING_DIR).then((files) => files.forEach(handleNewFile));
  const watcher = fs.watch(INCOMING_DIR, (_eventType, filename) => {
    if (filename) handleNewFile(filename);
  });
  // fs.watch (inotify) can miss events on some filesystems/containers — a
  // cheap poll closes that gap without depending on it being reliable.
  const pollTimer = setInterval(() => {
    fsp.readdir(INCOMING_DIR).then((files) => files.forEach(handleNewFile)).catch(() => {});
  }, 2000);
  watcher.pollTimer = pollTimer;
  console.log(`[watch] watching ${INCOMING_DIR} for camera uploads`);
  return watcher;
}
