import { hub } from "./ws.js";
import { WS_EVENTS } from "@tether/shared";

// Canon Camera Control API (CCAPI) endpoints, per Canon's published spec.
// Works with any CCAPI-supported EOS body (R5, R6/R6 Mark II, R7, R3, 1D X
// Mark III, and others — see Canon's developer community for the current
// list). The camera must have current firmware and CCAPI activated once
// through Canon's EOS Utility / developer-registration desktop tool — see
// chats/chat1.md's "how can I make this app live" answer. This module can't
// be exercised against real hardware in this environment; verify the paths
// below against the CCAPI version your camera actually reports before
// relying on it in the field.
const CCAPI_PORT = 8080;
const REQUEST_TIMEOUT_MS = 2500;
const MIN_SUPPORTED_MAJOR = 100; // "ver100" — reject anything CCAPI reports below this
const RECONCILE_HOLD_MS = 4000; // how long to show "reconciling" after a drop clears
const POLL_INTERVAL_MS = 4000;

async function fetchJson(url, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { httpStatus: res.status });
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

class CcapiMonitor {
  constructor() {
    /** @type {Map<string, {state: string, info: object|null, wasConnected: boolean, timers: object}>} */
    this.bySession = new Map();
  }

  _entry(sessionId) {
    if (!this.bySession.has(sessionId)) {
      this.bySession.set(sessionId, { state: "not_configured", info: null, wasConnected: false, timer: null, reconcileTimer: null });
    }
    return this.bySession.get(sessionId);
  }

  getState(sessionId) {
    return this._entry(sessionId).state;
  }

  getInfo(sessionId) {
    return this._entry(sessionId).info;
  }

  start(sessionId, cameraIp) {
    this.stop(sessionId);
    const entry = this._entry(sessionId);
    if (!cameraIp) {
      entry.state = "not_configured";
      return;
    }
    const poll = () => this._poll(sessionId, cameraIp);
    poll();
    entry.timer = setInterval(poll, POLL_INTERVAL_MS);
  }

  stop(sessionId) {
    const entry = this.bySession.get(sessionId);
    if (entry?.timer) clearInterval(entry.timer);
    if (entry?.reconcileTimer) clearTimeout(entry.reconcileTimer);
  }

  async _poll(sessionId, cameraIp) {
    const entry = this._entry(sessionId);
    const base = `http://${cameraIp}:${CCAPI_PORT}/ccapi`;
    let nextState;
    let info = entry.info;

    try {
      const versions = await fetchJson(`${base}/`);
      const apiVersion = (versions?.ver ?? []).slice(-1)[0] ?? null;
      const supported = (versions?.ver ?? []).some((v) => Number(v.replace(/\D/g, "")) >= MIN_SUPPORTED_MAJOR);
      if (!supported) {
        nextState = "firmware_too_old";
      } else {
        const [device, battery, storage] = await Promise.all([
          fetchJson(`${base}/ver100/deviceinformation`),
          fetchJson(`${base}/ver100/devicestatus/battery`).catch(() => null),
          fetchJson(`${base}/ver100/devicestatus/storage`).catch(() => null),
        ]);
        const card = storage?.storagelist?.[0];
        info = {
          serial: device?.serialnumber ?? null,
          productName: device?.productname ?? "Canon Camera",
          firmware: device?.firmwareversion ?? null,
          batteryLevel: battery?.level ?? null,
          cardFreeGb: card?.spacesize != null ? Math.round(card.spacesize / 1024) : null,
          apiVersion,
        };
        nextState = entry.state === "dropped" || entry.state === "reconciling" ? "reconciling" : "connected";
      }
    } catch (err) {
      // Connection refused / timed out / DNS failure — camera isn't reachable
      // at the configured address right now. We can't reliably distinguish
      // "CCAPI never activated" from "wrong network" purely over TCP; both
      // surface identically as an unreachable host.
      nextState = entry.wasConnected ? "dropped" : "wrong_network";
    }

    if (nextState === "connected" || nextState === "reconciling") entry.wasConnected = true;

    if (nextState === "reconciling" && entry.state !== "reconciling") {
      clearTimeout(entry.reconcileTimer);
      entry.reconcileTimer = setTimeout(() => {
        entry.state = "connected";
        this._emit(sessionId);
      }, RECONCILE_HOLD_MS);
    }

    const changed = nextState !== entry.state || JSON.stringify(info) !== JSON.stringify(entry.info);
    entry.state = nextState;
    entry.info = info;
    if (changed) this._emit(sessionId);
  }

  _emit(sessionId) {
    const entry = this._entry(sessionId);
    hub.broadcast(sessionId, WS_EVENTS.CAMERA_STATUS, { state: entry.state, info: entry.info });
  }
}

export const ccapiMonitor = new CcapiMonitor();
