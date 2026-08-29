import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext.jsx";
import { api } from "../lib/api.js";
import { accent } from "@tether/shared";
import { QrGlyph } from "../components/Glyphs.jsx";
import { timeAgo } from "../lib/format.js";

export function FeedScreen() {
  const navigate = useNavigate();
  const { session, photos } = useSession();
  const live = photos.filter((p) => p.status === "live");
  const hero = live[0] ?? null;
  const grid = live.slice(1, 31); // a wide iPad column shows more columns per row before it needs to scroll

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#0B0B0C" }}>
      <div
        style={{
          padding: "calc(env(safe-area-inset-top) + 12px) 22px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flex: "none",
          borderBottom: "1px solid rgba(242,240,236,.09)",
        }}
      >
        <div>
          <div style={{ font: "400 17px/1.2 'Helvetica Neue',Helvetica,sans-serif", color: "#F2F0EC" }}>{session.name}</div>
          <div style={{ font: "400 10px/1 'IBM Plex Mono',monospace", color: "rgba(242,240,236,.4)", letterSpacing: ".09em", marginTop: 6 }}>
            {photos.length.toLocaleString()} SHOTS · {session.deliveryMode.toUpperCase()}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${accent.live}80`, borderRadius: 20, padding: "5px 10px" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: accent.live, display: "block" }} />
            <span style={{ font: "500 9.5px/1 'IBM Plex Mono',monospace", color: accent.liveText, letterSpacing: ".1em" }}>LIVE</span>
          </div>
          <div
            onClick={() => navigate("/qr")}
            style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid rgba(242,240,236,.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <QrGlyph color="#F2F0EC" />
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 22px 0" }}>
        {hero ? (
          <div
            onClick={() => navigate(`/photo/${hero.id}`)}
            style={{ position: "relative", borderRadius: 10, overflow: "hidden", height: 250, background: "#333", cursor: "pointer" }}
          >
            <img src={api.fileUrl(hero.id, "preview")} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", left: 11, top: 11, background: "rgba(11,11,12,.72)", borderRadius: 6, padding: "5px 9px", font: "500 9.5px/1 'IBM Plex Mono',monospace", color: "#F2F0EC", letterSpacing: ".08em" }}>
              {timeAgo(hero.capturedAt)}
            </div>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                padding: "10px 12px",
                background: "linear-gradient(rgba(11,11,12,0),rgba(11,11,12,.8))",
                font: "400 10px/1 'IBM Plex Mono',monospace",
                color: "rgba(242,240,236,.78)",
                letterSpacing: ".07em",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{[hero.exif.lens, hero.exif.aperture, hero.exif.shutter, hero.exif.iso && `ISO ${hero.exif.iso}`].filter(Boolean).join(" · ") || "—"}</span>
              <span>{hero.filename}</span>
            </div>
          </div>
        ) : (
          <div style={{ height: 250, borderRadius: 10, border: "1px dashed rgba(242,240,236,.18)", display: "flex", alignItems: "center", justifyContent: "center", font: "400 12.5px/1.5 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(242,240,236,.4)", textAlign: "center", padding: 20 }}>
            Waiting on the first shot from the camera…
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0 9px" }}>
          <span style={{ font: "500 10px/1 'IBM Plex Mono',monospace", color: "rgba(242,240,236,.4)", letterSpacing: ".12em" }}>EARLIER</span>
          <span style={{ font: "500 10px/1 'IBM Plex Mono',monospace", color: "rgba(242,240,236,.4)", letterSpacing: ".08em" }}>ALL IN GALLERY</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))", gap: 6, paddingBottom: 20 }}>
          {grid.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/photo/${p.id}`)}
              style={{ aspectRatio: "1", borderRadius: 4, overflow: "hidden", cursor: "pointer", background: "#222" }}
            >
              <img src={api.fileUrl(p.id, "thumb")} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
