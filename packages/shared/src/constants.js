export const DELIVERY_MODES = /** @type {const} */ (["hotspot", "cloud"]);

export const WATERMARK_MODES = /** @type {const} */ ([
  "previews",
  "all",
  "never",
]);

export const WATERMARK_OPACITIES = [25, 45, 70];

export const CULL_STATES = /** @type {const} */ (["pending", "kept", "pulled"]);

/** Canon CCAPI pairing states — see chats/chat1.md turn 2. */
export const CAMERA_STATES = /** @type {const} */ ([
  "not_configured", // no camera IP saved yet
  "not_activated", // CCAPI never activated via Canon's desktop tool
  "firmware_too_old", // camera firmware predates CCAPI support
  "wrong_network", // camera unreachable at the configured IP
  "connecting", // handshake in progress
  "connected", // linked, status polling normally
  "dropped", // was connected, now unreachable mid-session
  "reconciling", // back online, catching up on missed shots
]);

export const FACE_EMBEDDING_LENGTH = 128; // face-api.js FaceRecognitionNet output size

export const WS_EVENTS = /** @type {const} */ ({
  PHOTO_ADDED: "photo:added",
  PHOTO_UPDATED: "photo:updated",
  SESSION_UPDATED: "session:updated",
  CAMERA_STATUS: "camera:status",
  STATS_UPDATED: "stats:updated",
});

export function formatCount(n) {
  return n.toLocaleString("en-US");
}
