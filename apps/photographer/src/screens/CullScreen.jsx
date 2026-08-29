import { useSession } from "../context/SessionContext.jsx";
import { api } from "../lib/api.js";
import { accent } from "@tether/shared";

export function CullScreen() {
  const { photos, cullPhoto } = useSession();
  const ordered = [...photos].sort((a, b) => a.seq - b.seq);
  const total = ordered.length;
  const reviewed = ordered.filter((p) => p.cullState !== "pending").length;
  const current = ordered.find((p) => p.cullState === "pending");
  const pct = total ? Math.round((reviewed / total) * 100) : 0;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0B0B0C", overflow: "hidden" }}>
      <div style={{ padding: "calc(env(safe-area-inset-top) + 12px) 22px 0", flex: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ font: "400 17px/1.2 'Helvetica Neue',Helvetica,sans-serif", color: "#F2F0EC" }}>Cull</span>
          <span style={{ font: "500 10px/1 'IBM Plex Mono',monospace", color: "rgba(242,240,236,.45)", letterSpacing: ".09em" }}>
            {reviewed} / {total} REVIEWED
          </span>
        </div>
        <div style={{ height: 2, background: "rgba(242,240,236,.13)", marginTop: 13, borderRadius: 2 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "#F2F0EC", borderRadius: 2, transition: "width .3s ease" }} />
        </div>
      </div>

      <div style={{ flex: 1, padding: "22px 22px 0", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
        {current ? (
          <>
            <div style={{ position: "absolute", left: 32, right: 32, top: 32, bottom: 32, borderRadius: 8, background: "#3a332c", transform: "rotate(-1.4deg)" }} />
            <div style={{ aspectRatio: "3/4", borderRadius: 8, position: "relative", overflow: "hidden", boxShadow: "0 12px 34px rgba(0,0,0,.5)" }}>
              <img src={api.fileUrl(current.id, "preview")} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "11px 13px", background: "linear-gradient(rgba(11,11,12,0),rgba(11,11,12,.78))", font: "400 10px/1 'IBM Plex Mono',monospace", color: "rgba(242,240,236,.75)", letterSpacing: ".07em" }}>
                {current.filename} · {[current.exif.aperture, current.exif.shutter, current.exif.iso && `ISO ${current.exif.iso}`].filter(Boolean).join(" · ") || "—"}
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", font: "400 15px/1.5 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(242,240,236,.5)" }}>
            All caught up. Nothing left to cull.
          </div>
        )}
      </div>

      <div style={{ flex: "none", padding: "20px 22px max(34px, env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", gap: 13 }}>
        <div style={{ textAlign: "center", font: "400 10.5px/1 'IBM Plex Mono',monospace", color: "rgba(242,240,236,.32)", letterSpacing: ".11em" }}>
          SWIPE LEFT TO PULL · RIGHT TO KEEP
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div
            onClick={() => current && cullPhoto(current.id, "pull")}
            style={{ height: 58, borderRadius: 14, border: `1px solid ${accent.danger}8c`, color: accent.dangerText, display: "flex", alignItems: "center", justifyContent: "center", font: "400 16px/1 'Helvetica Neue',Helvetica,sans-serif", cursor: current ? "pointer" : "default", opacity: current ? 1 : 0.4 }}
          >
            Pull
          </div>
          <div
            onClick={() => current && cullPhoto(current.id, "keep")}
            style={{ height: 58, borderRadius: 14, background: "#F2F0EC", color: "#0B0B0C", display: "flex", alignItems: "center", justifyContent: "center", font: "500 16px/1 'Helvetica Neue',Helvetica,sans-serif", cursor: current ? "pointer" : "default", opacity: current ? 1 : 0.4 }}
          >
            Keep
          </div>
        </div>
      </div>
    </div>
  );
}
