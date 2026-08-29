import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { useSocket } from "../lib/useSocket.js";
import { WS_EVENTS } from "@tether/shared";

const GuestCtx = createContext(null);

export function GuestProvider({ children }) {
  const { slug } = useParams();
  const [session, setSession] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [selection, setSelection] = useState([]);
  const [matchedIds, setMatchedIds] = useState(null); // null = "find" hasn't run yet
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const scannedRef = useRef(false);

  const showToast = useCallback((text, tag) => {
    clearTimeout(toastTimer.current);
    setToast({ text, tag });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .session(slug)
      .then(({ session }) => {
        if (cancelled) return;
        setSession(session);
        if (!scannedRef.current) {
          scannedRef.current = true;
          api.scan(slug).catch(() => {});
        }
      })
      .catch(() => !cancelled && setNotFound(true));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!session) return;
    api.photos(slug).then(({ photos }) => setPhotos(photos));
  }, [session?.id, slug]);

  useSocket(
    session?.id,
    useCallback((msg) => {
      switch (msg.type) {
        case WS_EVENTS.PHOTO_ADDED:
          setPhotos((prev) => [msg.payload.photo, ...prev]);
          break;
        case WS_EVENTS.PHOTO_UPDATED: {
          const p = msg.payload.photo;
          setPhotos((prev) => {
            const exists = prev.some((x) => x.id === p.id);
            if (p.status !== "live") return prev.filter((x) => x.id !== p.id);
            return exists ? prev.map((x) => (x.id === p.id ? { ...x, ...p } : x)) : [p, ...prev];
          });
          break;
        }
        case WS_EVENTS.SESSION_UPDATED:
          setSession((prev) => (prev ? { ...prev, ...msg.payload.session } : prev));
          break;
      }
    }, [])
  );

  const toggleSelect = (id) =>
    setSelection((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.concat(id)));

  const downloadPhoto = (id) => {
    const a = document.createElement("a");
    a.href = api.downloadUrl(id);
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadSelected = () => {
    if (selection.length === 0) {
      showToast("Tap photos to select them first.", "NOTHING PICKED");
      return;
    }
    selection.forEach(downloadPhoto);
    showToast(
      `${selection.length} ${selection.length === 1 ? "photo" : "photos"} saved at full resolution.`,
      "DONE"
    );
  };

  return (
    <GuestCtx.Provider
      value={{
        slug,
        session,
        notFound,
        photos,
        selection,
        toggleSelect,
        downloadPhoto,
        downloadSelected,
        matchedIds,
        setMatchedIds,
        toast,
        showToast,
      }}
    >
      {children}
    </GuestCtx.Provider>
  );
}

export function useGuest() {
  const ctx = useContext(GuestCtx);
  if (!ctx) throw new Error("useGuest must be used within GuestProvider");
  return ctx;
}
