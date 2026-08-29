import os from "node:os";

/** Best-guess LAN IPv4 address — what a QR code should point guests at on the hotspot. */
export function getLanIp() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name] ?? []) {
      if (iface.family === "IPv4" && !iface.internal) return iface.address;
    }
  }
  return "127.0.0.1";
}

const GUEST_PORT = process.env.GUEST_PORT || 5174;

export function guestJoinUrl(session) {
  if (session.deliveryMode === "cloud" && process.env.CLOUD_BASE_URL) {
    return `${process.env.CLOUD_BASE_URL.replace(/\/$/, "")}/g/${session.slug}`;
  }
  if (process.env.HOTSPOT_BASE_URL) {
    return `${process.env.HOTSPOT_BASE_URL.replace(/\/$/, "")}/g/${session.slug}`;
  }
  return `http://${getLanIp()}:${GUEST_PORT}/g/${session.slug}`;
}
