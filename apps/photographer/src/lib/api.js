const BASE = "/api";

async function req(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${method} ${path} → ${res.status} ${text}`);
  }
  return res.json();
}

export const api = {
  currentSession: () => req("GET", "/session/current"),
  updateSession: (id, patch) => req("PATCH", `/session/${id}`, patch),
  setDelivery: (id, mode) => req("PATCH", `/session/${id}/delivery`, { mode }),
  setWatermark: (id, patch) => req("PATCH", `/session/${id}/watermark`, patch),
  setKeepRaw: (id, keepRaw) => req("PATCH", `/session/${id}/keep-raw`, { keepRaw }),
  startSession: (id) => req("POST", `/session/${id}/start`),
  endSession: (id) => req("POST", `/session/${id}/end`),
  cameraStatus: (id) => req("GET", `/session/${id}/camera-status`),
  qr: (id) => req("GET", `/session/${id}/qr`),
  stats: (id) => req("GET", `/session/${id}/stats`),
  photos: (id) => req("GET", `/session/${id}/photos`),
  photo: (id) => req("GET", `/photos/${id}`),
  pullPhoto: (id) => req("POST", `/photos/${id}/pull`),
  restorePhoto: (id) => req("POST", `/photos/${id}/restore`),
  starPhoto: (id, starred) => req("PATCH", `/photos/${id}/star`, { starred }),
  cullPhoto: (id, action) => req("POST", `/photos/${id}/cull`, { action }),
  setEmbedding: (id, embedding) => req("PATCH", `/photos/${id}/embedding`, { embedding }),
  fileUrl: (id, variant = "preview") => `${BASE}/photos/${id}/file?variant=${variant}`,
};
