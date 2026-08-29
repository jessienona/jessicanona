import { useNavigate } from "react-router-dom";
import { useGuest } from "../context/GuestContext.jsx";
import { api } from "../lib/api.js";

export function GalleryScreen() {
  const navigate = useNavigate();
  const { slug, session, photos, selection, toggleSelect, downloadSelected, matchedIds, setMatchedIds } = useGuest();

  if (!session) return null;

  const shown = matchedIds ? photos.filter((p) => matchedIds.includes(p.id)) : photos;
  const n = selection.length;
  const wmKey = `${session.watermark.mode}-${session.watermark.opacity}`;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F1EC", overflow: "hidden", position: "relative" }}>
      <div style={{ flex: "none", padding: "calc(env(safe-area-inset-top) + 12px) 22px 14px", borderBottom: "1px solid rgba(26,25,24,.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ font: "300 25px/1.1 'Cormorant Garamond',serif", color: "#1A1918" }}>{session.name}</span>
          <span style={{ font: "400 10px/1 'IBM Plex Mono',monospace", color: "rgba(26,25,24,.45)", letterSpacing: ".1em" }}>
            {shown.length.toLocaleString()} PHOTOS
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          <div
            onClick={() => navigate(`/g/${slug}/find`)}
            style={{ border: "1px solid rgba(26,25,24,.9)", borderRadius: 20, padding: "8px 14px", font: "400 12.5px/1 'Helvetica Neue',Helvetica,sans-serif", color: "#1A1918", cursor: "pointer" }}
          >
            Find my photos
          </div>
          {matchedIds ? (
            <div
              onClick={() => setMatchedIds(null)}
              style={{ border: "1px solid rgba(26,25,24,.16)", borderRadius: 20, padding: "8px 14px", font: "400 12.5px/1 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(26,25,24,.55)", cursor: "pointer" }}
            >
              ✕ Just you
            </div>
          ) : (
            <>
              <div style={{ border: "1px solid rgba(26,25,24,.16)", borderRadius: 20, padding: "8px 14px", font: "400 12.5px/1 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(26,25,24,.55)" }}>
                Ceremony
              </div>
              <div style={{ border: "1px solid rgba(26,25,24,.16)", borderRadius: 20, padding: "8px 14px", font: "400 12.5px/1 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(26,25,24,.55)" }}>
                Toasts
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 22px 100px" }}>
        {shown.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", font: "400 14px/1.6 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(26,25,24,.45)" }}>
            {matchedIds ? "No matches found — try browsing everything." : "Photos will appear here the moment they're taken."}
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 9 }}>
          {shown.map((p, i) => {
            const on = selection.includes(p.id);
            return (
              <div
                key={p.id}
                onClick={() => toggleSelect(p.id)}
                style={{
                  aspectRatio: i % 3 === 1 ? "3/4" : "1",
                  borderRadius: 5,
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  boxShadow: on ? "0 0 0 2px #1A1918" : "0 0 0 0 rgba(0,0,0,0)",
                }}
              >
                <img
                  src={`${api.fileUrl(p.id, "thumb")}&wm=${wmKey}`}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <div style={{ position: "absolute", right: 8, top: 8, width: 19, height: 19, borderRadius: "50%", background: on ? "#1A1918" : "rgba(255,255,255,.35)", border: "1px solid rgba(255,255,255,.75)" }} />
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/g/${slug}/photo/${p.id}`);
                  }}
                  style={{ position: "absolute", left: 8, bottom: 8, padding: "4px 8px", borderRadius: 6, background: "rgba(251,249,246,.85)", font: "400 9.5px/1 'IBM Plex Mono',monospace", color: "#1A1918", letterSpacing: ".05em" }}
                >
                  OPEN
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        onClick={downloadSelected}
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 26,
          height: 56,
          borderRadius: 15,
          background: "#1A1918",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 8px 0 20px",
          boxShadow: "0 10px 28px rgba(0,0,0,.22)",
          cursor: "pointer",
        }}
      >
        <span style={{ font: "400 14px/1 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(244,241,236,.72)" }}>
          {n === 0 ? "Select photos to download" : `${n} ${n === 1 ? "photo" : "photos"} selected`}
        </span>
        <span style={{ background: "#F4F1EC", color: "#1A1918", borderRadius: 11, padding: "12px 18px", font: "500 14px/1 'Helvetica Neue',Helvetica,sans-serif" }}>
          Download
        </span>
      </div>
    </div>
  );
}
