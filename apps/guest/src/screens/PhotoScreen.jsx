import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGuest } from "../context/GuestContext.jsx";
import { api } from "../lib/api.js";

function megapixels(w, h) {
  if (!w || !h) return null;
  return Math.round((w * h) / 1_000_000);
}

export function PhotoScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { slug, session, photos, downloadPhoto } = useGuest();
  const [saved, setSaved] = useState(false);
  const [fav, setFav] = useState(false);

  const idx = photos.findIndex((p) => p.id === id);
  const photo = photos[idx];
  if (!session || !photo) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span onClick={() => navigate(`/g/${slug}/gallery`)} style={{ font: "400 14px/1 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(26,25,24,.5)", cursor: "pointer" }}>
          ‹ Back to gallery
        </span>
      </div>
    );
  }

  const wm = session.watermark;
  const wmOpacity = wm.mode === "never" ? 0 : wm.opacity / 100;
  const note =
    wm.mode === "never" ? "No watermark on this gallery." : wm.mode === "all" ? "The mark stays on your download." : "Preview is watermarked. Your download is clean.";
  const mp = megapixels(photo.width, photo.height);
  const time = new Date(photo.capturedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  function onDownload() {
    downloadPhoto(photo.id);
    setSaved(true);
  }

  async function onShare() {
    const url = `${location.origin}${api.downloadUrl(photo.id)}`;
    if (navigator.share) {
      navigator.share({ title: session.name, url }).catch(() => {});
    } else {
      await navigator.clipboard?.writeText(url).catch(() => {});
    }
  }

  return (
    <>
      <div style={{ padding: "calc(env(safe-area-inset-top) + 12px) 22px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", flex: "none" }}>
        <span onClick={() => navigate(`/g/${slug}/gallery`)} style={{ font: "400 14px/1 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(26,25,24,.5)", cursor: "pointer" }}>
          ‹ Gallery
        </span>
        <span style={{ font: "400 10px/1 'IBM Plex Mono',monospace", color: "rgba(26,25,24,.42)", letterSpacing: ".1em" }}>
          {idx + 1} / {photos.length}
        </span>
      </div>
      <div style={{ flex: 1, padding: "0 22px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
        <div style={{ aspectRatio: "4/5", borderRadius: 6, position: "relative", overflow: "hidden", background: "#dcd6cb" }}>
          <img src={`${api.fileUrl(photo.id, "preview")}&wm=${wm.mode}-${wm.opacity}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", right: 14, bottom: 14, font: "300 13px/1 'Cormorant Garamond',serif", color: "rgba(26,25,24,.5)", letterSpacing: ".3em", opacity: wmOpacity }}>
            JESSICA NONA
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", font: "400 10px/1 'IBM Plex Mono',monospace", color: "rgba(26,25,24,.42)", letterSpacing: ".07em" }}>
          <span>{time}</span>
          <span>{photo.width && photo.height ? `${photo.width} × ${photo.height}${mp ? ` · ${mp} MP` : ""}` : "—"}</span>
        </div>
      </div>
      <div style={{ flex: "none", padding: "20px 22px max(34px, env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", gap: 11 }}>
        <div
          onClick={onDownload}
          style={{
            height: 54,
            borderRadius: 13,
            background: saved ? "transparent" : "#1A1918",
            color: saved ? "#1A1918" : "#F4F1EC",
            border: saved ? "1px solid rgba(26,25,24,.2)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            font: "500 16px/1 'Helvetica Neue',Helvetica,sans-serif",
            cursor: "pointer",
          }}
        >
          {saved ? "Saved to your photos" : "Download full resolution"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
          <div
            onClick={() => setFav((f) => !f)}
            style={{ height: 48, borderRadius: 12, border: "1px solid rgba(26,25,24,.2)", background: fav ? "#1A1918" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", font: "400 14px/1 'Helvetica Neue',Helvetica,sans-serif", color: fav ? "#F4F1EC" : "#1A1918", cursor: "pointer" }}
          >
            {fav ? "Favourited" : "Favourite"}
          </div>
          <div onClick={onShare} style={{ height: 48, borderRadius: 12, border: "1px solid rgba(26,25,24,.2)", display: "flex", alignItems: "center", justifyContent: "center", font: "400 14px/1 'Helvetica Neue',Helvetica,sans-serif", color: "#1A1918", cursor: "pointer" }}>
            Share
          </div>
        </div>
        <div style={{ textAlign: "center", font: "400 11px/1.5 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(26,25,24,.42)" }}>{note}</div>
      </div>
    </>
  );
}
