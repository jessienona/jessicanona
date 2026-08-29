const BASE = "/api/guest";

async function req(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = new Error(`${method} ${path} → ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export const api = {
  session: (slug) => req("GET", `/session/${slug}`),
  scan: (slug) => req("POST", `/session/${slug}/scan`),
  photos: (slug) => req("GET", `/session/${slug}/photos`),
  embeddings: (slug) => req("GET", `/session/${slug}/embeddings`),
  fileUrl: (id, variant = "preview") => `${BASE}/photos/${id}/file?variant=${variant}`,
  downloadUrl: (id) => `${BASE}/photos/${id}/download`,
};
