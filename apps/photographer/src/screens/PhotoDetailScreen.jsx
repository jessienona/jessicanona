import { useNavigate, useParams } from "react-router-dom";
import { useSession } from "../context/SessionContext.jsx";
import { api } from "../lib/api.js";
import { accent } from "@tether/shared";
import { QrGlyph } from "../components/Glyphs.jsx";

export function PhotoDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { photos, session, pullPhoto, restorePhoto, starPhoto } = useSession();
  const photo = photos.find((p) => p.id === id);

  if (!photo) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(242,240,236,.5)" }}>
        <span onClick={() => navigate("/feed")} style={{ cursor: "pointer" }}>‹ Back to feed</span>
      </div>
    );
  }

  const isPulled = photo.status === "pulled";
  const idx = photos.length - photos.findIndex((p) => p.id === id);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0B0B0C", overflow: "hidden" }}>
      <div style={{ padding: "calc(env(safe-area-inset-top) + 12px) 22px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flex: "none" }}>
        <span onClick={() => navigate("/feed")} style={{ font: "400 14px/1 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(242,240,236,.6)", cursor: "pointer" }}>
          ‹ Feed
        </span>
        <span style={{ font: "500 10px/1 'IBM Plex Mono',monospace", color: "rgba(242,240,236,.4)", letterSpacing: ".09em" }}>
          {photo.filename} · {idx} / {photos.length}
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 22px" }}>
        <div style={{ aspectRatio: "4/5", borderRadius: 8, position: "relative", overflow: "hidden", background: "#222" }}>
          <img src={api.fileUrl(photo.id, "preview")} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", right: 14, bottom: 14, opacity: 0.5, font: "300 12px/1 'Cormorant Garamond',serif", color: "#F2F0EC", letterSpacing: ".3em" }}>
            JESSICA NONA
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, padding: "17px 2px 0", font: "400 10px/1.55 'IBM Plex Mono',monospace", color: "rgba(242,240,236,.4)", letterSpacing: ".04em" }}>
          <div>LENS<div style={{ color: "#F2F0EC" }}>{photo.exif.lens ?? "—"}</div></div>
          <div>APERTURE<div style={{ color: "#F2F0EC" }}>{photo.exif.aperture ?? "—"}</div></div>
          <div>SHUTTER<div style={{ color: "#F2F0EC" }}>{photo.exif.shutter ?? "—"}</div></div>
          <div>ISO<div style={{ color: "#F2F0EC" }}>{photo.exif.iso ?? "—"}</div></div>
        </div>

        <div style={{ marginTop: 18, padding: "13px 15px", border: "1px solid rgba(242,240,236,.11)", borderRadius: 11, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ font: "400 13px/1.3 'Helvetica Neue',Helvetica,sans-serif", color: isPulled ? accent.dangerText : "rgba(242,240,236,.7)" }}>
            {isPulled ? "Pulled from guest gallery" : "Live in guest gallery"}
          </span>
          <span style={{ font: "500 10px/1 'IBM Plex Mono',monospace", color: accent.liveText, letterSpacing: ".08em" }}>
            {isPulled ? "HIDDEN" : `${photo.downloads} DOWNLOADS`}
          </span>
        </div>
      </div>

      <div style={{ flex: "none", padding: "18px 22px max(34px, env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div
            onClick={() => (isPulled ? restorePhoto(photo.id) : pullPhoto(photo.id))}
            style={{
              height: 50,
              borderRadius: 12,
              border: `1px solid ${isPulled ? `${accent.danger}8c` : "rgba(242,240,236,.2)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              font: "400 15px/1 'Helvetica Neue',Helvetica,sans-serif",
              color: isPulled ? accent.dangerText : "rgba(242,240,236,.85)",
              cursor: "pointer",
            }}
          >
            {isPulled ? "Restore" : "Pull from gallery"}
          </div>
          <div
            onClick={() => starPhoto(photo.id, !photo.starred)}
            style={{
              height: 50,
              borderRadius: 12,
              border: `1px solid ${photo.starred ? "rgba(242,240,236,.85)" : "rgba(242,240,236,.2)"}`,
              background: photo.starred ? "rgba(242,240,236,.1)" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              font: "400 15px/1 'Helvetica Neue',Helvetica,sans-serif",
              color: "#F2F0EC",
              cursor: "pointer",
            }}
          >
            {photo.starred ? "Starred" : "Star"}
          </div>
        </div>
        <div
          onClick={() => navigate("/qr")}
          style={{ height: 52, borderRadius: 13, background: "#F2F0EC", color: "#0B0B0C", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, font: "500 16px/1 'Helvetica Neue',Helvetica,sans-serif", cursor: "pointer" }}
        >
          <QrGlyph color="#0B0B0C" /> QR for this shot
        </div>
      </div>
    </div>
  );
}
