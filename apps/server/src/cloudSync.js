import { CloudQueue, Sessions, Photos } from "./models.js";
import { getCloudAdapter } from "./cloudAdapter.js";
import { hub } from "./ws.js";
import { WS_EVENTS } from "@tether/shared";

const DRAIN_INTERVAL_MS = 1500;
const adapter = getCloudAdapter();

/**
 * Drains the cloud queue for any session currently in "cloud" delivery
 * mode. Sessions on "hotspot" mode are left queued on purpose — the design
 * treats that as "no internet, syncs later" (see the "Queued for cloud"
 * stat), and it drains automatically the moment a session's mode flips to
 * cloud (Setup screen or session start).
 */
export function startCloudSyncWorker() {
  const timer = setInterval(async () => {
    const pending = CloudQueue.allPending();
    if (pending.length === 0) return;

    const bySession = new Map();
    for (const item of pending) {
      if (!bySession.has(item.session_id)) bySession.set(item.session_id, []);
      bySession.get(item.session_id).push(item);
    }

    for (const [sessionId, items] of bySession) {
      const session = Sessions.get(sessionId);
      if (!session || session.deliveryMode !== "cloud") continue;

      for (const item of items.slice(0, 5)) {
        try {
          const photo = Photos.get(item.photo_id);
          if (!photo) {
            CloudQueue.markUploaded(item.id);
            continue;
          }
          await adapter.upload({ sessionId, photoId: photo.id, filePath: photo.originalPath });
          CloudQueue.markUploaded(item.id);
        } catch (err) {
          console.error(`[cloud-sync] upload failed for ${item.photo_id}:`, err.message);
          CloudQueue.markFailed(item.id);
        }
      }
      hub.broadcast(sessionId, WS_EVENTS.STATS_UPDATED, {
        queued: CloudQueue.pendingCount(sessionId),
      });
    }
  }, DRAIN_INTERVAL_MS);
  return timer;
}
