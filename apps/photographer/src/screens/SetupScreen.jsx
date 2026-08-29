import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext.jsx";
import { api } from "../lib/api.js";
import { accent } from "@tether/shared";
import { InstallHint } from "../components/InstallHint.jsx";

const OPACITIES = [25, 45, 70];

function chipStyle(active) {
  return {
    border: active ? "1px solid rgba(242,240,236,.9)" : "1px solid rgba(242,240,236,.16)",
    background: active ? "rgba(242,240,236,.1)" : "transparent",
    color: active ? "#F2F0EC" : "rgba(242,240,236,.55)",
  };
}

function Row({ label, value, valueColor = "rgba(242,240,236,.5)", onClick }) {
  return (
    <div onClick={onClick} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0", borderTop: "1px solid rgba(242,240,236,.09)", cursor: onClick ? "pointer" : "default" }}>
      <span style={{ font: "400 14.5px/1 'Helvetica Neue',Helvetica,sans-serif", color: "#F2F0EC" }}>{label}</span>
      <span style={{ font: "400 12px/1 'IBM Plex Mono',monospace", color: valueColor }}>{value}</span>
    </div>
  );
}

function WatermarkTab({ session, photos, setWatermark, setKeepRaw }) {
  const { mode, opacity } = session.watermark;
  const preview = photos.find((p) => p.status === "live");
  const wmOpacity = mode === "never" ? 0 : opacity / 100;
  const note =
    mode === "previews"
      ? "Guests see the mark while browsing. Downloads are clean files."
      : mode === "all"
      ? "The mark is burned into downloads too. Guests cannot get a clean file."
      : "No mark anywhere. Nothing identifies the images as yours.";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ font: "500 10px/1 'IBM Plex Mono',monospace", color: "rgba(242,240,236,.4)", letterSpacing: ".13em" }}>APPLY WATERMARK TO</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", border: "1px solid rgba(242,240,236,.14)", borderRadius: 10, overflow: "hidden" }}>
          {["previews", "all", "never"].map((m, i) => {
            const active = mode === m;
            return (
              <div
                key={m}
                onClick={() => setWatermark({ mode: m })}
                style={{
                  padding: "12px 0",
                  textAlign: "center",
                  background: active ? "#F2F0EC" : "transparent",
                  color: active ? "#0B0B0C" : "rgba(242,240,236,.6)",
                  font: "400 12.5px/1 'Helvetica Neue',Helvetica,sans-serif",
                  borderLeft: i > 0 ? "1px solid rgba(242,240,236,.14)" : "none",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {m}
              </div>
            );
          })}
        </div>
        <div style={{ font: "400 12px/1.55 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(242,240,236,.4)" }}>{note}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ font: "500 10px/1 'IBM Plex Mono',monospace", color: "rgba(242,240,236,.4)", letterSpacing: ".13em" }}>PREVIEW</div>
        <div style={{ border: "1px solid rgba(242,240,236,.12)", borderRadius: 10, aspectRatio: "3/2", position: "relative", overflow: "hidden", background: "#3a332c" }}>
          {preview && <img src={api.fileUrl(preview.id, "thumb")} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
          <div style={{ position: "absolute", right: 14, bottom: 12, font: "300 13px/1 'Cormorant Garamond',serif", color: "#F2F0EC", letterSpacing: ".26em", opacity: wmOpacity }}>
            JESSICA NONA
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ font: "500 10px/1 'IBM Plex Mono',monospace", color: "rgba(242,240,236,.4)", letterSpacing: ".13em" }}>OPACITY</span>
          <span style={{ font: "500 10px/1 'IBM Plex Mono',monospace", color: "#F2F0EC" }}>{mode === "never" ? "OFF" : `${opacity}%`}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {OPACITIES.map((o) => {
            const s = chipStyle(opacity === o);
            return (
              <div
                key={o}
                onClick={() => setWatermark({ opacity: o })}
                style={{ flex: 1, height: 36, borderRadius: 9, border: s.border, background: s.background, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", font: "400 12px/1 'IBM Plex Mono',monospace", cursor: "pointer" }}
              >
                {o}%
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <Row label="Guest download size" value="FULL 6000PX" />
        <Row label="Colour preset" value="JN WARM 03" />
        <div onClick={() => setKeepRaw(!session.keepRaw)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0", borderTop: "1px solid rgba(242,240,236,.09)", cursor: "pointer" }}>
          <span style={{ font: "400 14.5px/1 'Helvetica Neue',Helvetica,sans-serif", color: "#F2F0EC" }}>Keep RAW on device</span>
          <span
            style={{
              width: 42,
              height: 24,
              borderRadius: 12,
              background: session.keepRaw ? "#F2F0EC" : "rgba(242,240,236,.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: session.keepRaw ? "flex-end" : "flex-start",
              padding: "0 3px",
              transition: "all .2s ease",
            }}
          >
            <span style={{ width: 18, height: 18, borderRadius: "50%", background: session.keepRaw ? "#0B0B0C" : "rgba(242,240,236,.6)", display: "block" }} />
          </span>
        </div>
      </div>
    </div>
  );
}

function DeliveryTab({ session, stats, endSession }) {
  const navigate = useNavigate();
  const s = stats ?? { scans: 0, downloads: 0, scansPerHour: new Array(9).fill(0), mostDownloaded: null, queued: 0, devicesOnHotspot: 0 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ border: "1px solid rgba(242,240,236,.12)", borderRadius: 12, padding: 16 }}>
          <div style={{ font: "300 36px/1 'Cormorant Garamond',serif", color: "#F2F0EC" }}>{s.scans}</div>
          <div style={{ font: "500 9.5px/1.5 'IBM Plex Mono',monospace", color: "rgba(242,240,236,.42)", letterSpacing: ".1em", marginTop: 8 }}>SCANS</div>
        </div>
        <div style={{ border: "1px solid rgba(242,240,236,.12)", borderRadius: 12, padding: 16 }}>
          <div style={{ font: "300 36px/1 'Cormorant Garamond',serif", color: "#F2F0EC" }}>{s.downloads.toLocaleString()}</div>
          <div style={{ font: "500 9.5px/1.5 'IBM Plex Mono',monospace", color: "rgba(242,240,236,.42)", letterSpacing: ".1em", marginTop: 8 }}>DOWNLOADS</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ font: "500 10px/1 'IBM Plex Mono',monospace", color: "rgba(242,240,236,.4)", letterSpacing: ".13em" }}>SCANS PER HOUR</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 104 }}>
          {s.scansPerHour.map((h, i) => (
            <div key={i} style={{ flex: 1, background: "rgba(242,240,236,.85)", borderRadius: "2px 2px 0 0", height: `${h}%` }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", font: "400 9px/1 'IBM Plex Mono',monospace", color: "rgba(242,240,236,.32)", letterSpacing: ".08em" }}>
          <span>00:00</span><span>12:00</span><span>23:00</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <Row label="Most downloaded" value={s.mostDownloaded ? `${s.mostDownloaded.filename} · ${s.mostDownloaded.downloads}` : "—"} />
        <Row label="Queued for cloud" value={s.queued > 0 ? `${s.queued.toLocaleString()} WAITING` : "NONE"} valueColor={s.queued > 0 ? accent.liveText : "rgba(242,240,236,.5)"} />
        <Row label="Devices on hotspot" value={s.devicesOnHotspot} />
        <InstallHint />
      </div>

      <div
        onClick={async () => {
          await endSession();
          navigate("/connect");
        }}
        style={{ height: 50, borderRadius: 12, border: "1px solid rgba(242,240,236,.22)", display: "flex", alignItems: "center", justifyContent: "center", font: "400 15px/1 'Helvetica Neue',Helvetica,sans-serif", color: "#F2F0EC", cursor: "pointer" }}
      >
        End session &amp; archive
      </div>
    </div>
  );
}

export function SetupScreen() {
  const { session, photos, stats, setWatermark, setKeepRaw, endSession, refreshStats } = useSession();
  const [tab, setTab] = useState("wm");

  useEffect(() => {
    refreshStats();
    const t = setInterval(refreshStats, 5000);
    return () => clearInterval(t);
  }, [refreshStats]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0B0B0C", overflow: "hidden" }}>
      <div style={{ padding: "calc(env(safe-area-inset-top) + 12px) 22px 16px", flex: "none", display: "flex", gap: 8 }}>
        {[
          { key: "wm", label: "Watermark" },
          { key: "stats", label: "Delivery" },
        ].map((t) => {
          const active = tab === t.key;
          return (
            <div
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "8px 14px",
                borderRadius: 20,
                border: active ? "1px solid rgba(242,240,236,.9)" : "1px solid rgba(242,240,236,.16)",
                background: active ? "rgba(242,240,236,.1)" : "transparent",
                color: active ? "#F2F0EC" : "rgba(242,240,236,.55)",
                font: "400 12.5px/1 'Helvetica Neue',Helvetica,sans-serif",
                cursor: "pointer",
              }}
            >
              {t.label}
            </div>
          );
        })}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 22px 30px" }}>
        {tab === "wm" ? (
          <WatermarkTab session={session} photos={photos} setWatermark={setWatermark} setKeepRaw={setKeepRaw} />
        ) : (
          <DeliveryTab session={session} stats={stats} endSession={endSession} />
        )}
      </div>
    </div>
  );
}
