const TTL_MS = 5 * 60 * 1000;

/** In-memory "who's currently browsing the guest gallery" — a real router's
 * DHCP lease table would back "devices on hotspot" in production; this
 * approximates it from guest API traffic so the stat isn't hardcoded. */
class Presence {
  constructor() {
    /** @type {Map<string, Map<string, number>>} sessionId -> (clientKey -> lastSeen) */
    this.bySession = new Map();
  }
  touch(sessionId, clientKey) {
    if (!this.bySession.has(sessionId)) this.bySession.set(sessionId, new Map());
    this.bySession.get(sessionId).set(clientKey, Date.now());
  }
  count(sessionId) {
    const clients = this.bySession.get(sessionId);
    if (!clients) return 0;
    const now = Date.now();
    let n = 0;
    for (const [key, seenAt] of clients) {
      if (now - seenAt > TTL_MS) clients.delete(key);
      else n += 1;
    }
    return n;
  }
}

export const presence = new Presence();

export function clientKeyFor(req) {
  return `${req.ip}:${req.headers["user-agent"] ?? ""}`;
}
