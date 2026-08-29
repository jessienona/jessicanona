import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api } from "../lib/api.js";
import { useSocket } from "../lib/useSocket.js";
import { computeFaceEmbedding } from "../lib/faceEmbed.js";
import { useInstallPrompt } from "../lib/useInstallPrompt.js";
import { WS_EVENTS } from "@tether/shared";

const SessionCtx = createContext(null);

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [cameraStatus, setCameraStatus] = useState({ state: "not_configured", info: null });
  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  // Mounted here (not inside the Setup screen's Delivery tab) so the
  // `beforeinstallprompt` listener is always attached — the browser only
  // fires it once, and a listener that isn't there yet misses it for good.
  const install = useInstallPrompt();

  const showToast = useCallback((text, tag) => {
    clearTimeout(toastTimer.current);
    setToast({ text, tag });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  // Initial load
  useEffect(() => {
    api.currentSession().then(({ session }) => setSession(session));
  }, []);

  useEffect(() => {
    if (!session) return;
    api.photos(session.id).then(({ photos }) => setPhotos(photos));
    api.cameraStatus(session.id).then(setCameraStatus);
  }, [session?.id]);

  const refreshStats = useCallback(() => {
    if (!session) return;
    api.stats(session.id).then(setStats);
  }, [session?.id]);

  // A photo just landed — try to compute a face embedding for it client-side
  // and post the descriptor back. Never blocks the UI; failures are silent
  // (no face in frame, model still loading, etc.).
  const embedInFlight = useRef(new Set());
  const tryEmbed = useCallback((photo) => {
    if (photo.hasEmbedding || embedInFlight.current.has(photo.id)) return;
    embedInFlight.current.add(photo.id);
    computeFaceEmbedding(api.fileUrl(photo.id, "thumb"))
      .then((embedding) => {
        if (embedding) return api.setEmbedding(photo.id, embedding);
      })
      .catch((err) => console.warn("face embed failed for", photo.id, err))
      .finally(() => embedInFlight.current.delete(photo.id));
  }, []);

  useSocket(
    session?.id,
    useCallback(
      (msg) => {
        switch (msg.type) {
          case WS_EVENTS.PHOTO_ADDED:
            setPhotos((prev) => [msg.payload.photo, ...prev]);
            tryEmbed(msg.payload.photo);
            break;
          case WS_EVENTS.PHOTO_UPDATED:
            setPhotos((prev) => prev.map((p) => (p.id === msg.payload.photo.id ? msg.payload.photo : p)));
            break;
          case WS_EVENTS.SESSION_UPDATED:
            setSession(msg.payload.session);
            break;
          case WS_EVENTS.CAMERA_STATUS:
            setCameraStatus(msg.payload);
            break;
          case WS_EVENTS.STATS_UPDATED:
            setStats((prev) => (prev ? { ...prev, ...msg.payload } : prev));
            break;
        }
      },
      [tryEmbed]
    )
  );

  const actions = {
    updateSession: async (patch) => setSession((await api.updateSession(session.id, patch)).session),
    setDeliveryMode: async (mode) => setSession((await api.setDelivery(session.id, mode)).session),
    setWatermark: async (patch) => setSession((await api.setWatermark(session.id, patch)).session),
    setKeepRaw: async (keepRaw) => setSession((await api.setKeepRaw(session.id, keepRaw)).session),
    startSession: async () => {
      const { session: s } = await api.startSession(session.id);
      setSession(s);
      showToast("Tethered. Shots will appear as you take them.", "LIVE");
    },
    endSession: async () => {
      await api.endSession(session.id);
      const { session: s } = await api.currentSession();
      setSession(s);
      setPhotos([]);
    },
    pullPhoto: async (id) => {
      const { photo } = await api.pullPhoto(id);
      setPhotos((prev) => prev.map((p) => (p.id === id ? photo : p)));
      showToast("Pulled. Guests can no longer see it.", "HIDDEN");
    },
    restorePhoto: async (id) => {
      const { photo } = await api.restorePhoto(id);
      setPhotos((prev) => prev.map((p) => (p.id === id ? photo : p)));
      showToast("Back in the guest gallery.", "LIVE");
    },
    starPhoto: async (id, starred) => {
      const { photo } = await api.starPhoto(id, starred);
      setPhotos((prev) => prev.map((p) => (p.id === id ? photo : p)));
    },
    cullPhoto: async (id, action) => {
      const { photo, cull } = await api.cullPhoto(id, action);
      setPhotos((prev) => prev.map((p) => (p.id === id ? photo : p)));
      setStats((prev) => (prev ? { ...prev, cull } : prev));
      if (action === "pull") showToast("Pulled from the guest gallery.", "HIDDEN");
      return cull;
    },
    refreshStats,
    showToast,
  };

  return (
    <SessionCtx.Provider value={{ session, photos, cameraStatus, stats, toast, install, ...actions }}>
      {children}
    </SessionCtx.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
