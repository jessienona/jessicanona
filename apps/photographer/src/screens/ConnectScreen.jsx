import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext.jsx";
import { accent, dark } from "@tether/shared";

const CAMERA_STATE_META = {
  not_configured: { label: "NOT CONFIGURED", color: dark.inkFaint, dot: "rgba(242,240,236,.3)" },
  not_activated: { label: "NOT ACTIVATED", color: accent.liveText, dot: accent.live },
  firmware_too_old: { label: "FIRMWARE TOO OLD", color: accent.dangerText, dot: accent.danger },
  wrong_network: { label: "UNREACHABLE", color: accent.dangerText, dot: accent.danger },
  connecting: { label: "CONNECTING…", color: accent.liveText, dot: accent.live },
  connected: { label: "LINKED", color: accent.linked, dot: accent.linked },
  dropped: { label: "DROPPED", color: accent.dangerText, dot: accent.danger },
  reconciling: { label: "RECONCILING…", color: accent.liveText, dot: accent.live },
};

function radioStyle(on) {
  return {
    border: on ? "rgba(242,240,236,.85)" : "rgba(242,240,236,.13)",
    bg: on ? "rgba(242,240,236,.06)" : "transparent",
    dotBorder: on ? "#F2F0EC" : "rgba(242,240,236,.3)",
    dot: on ? "#F2F0EC" : "transparent",
  };
}

function DeliveryOption({ active, title, blurb, onClick }) {
  const s = radioStyle(active);
  return (
    <div
      onClick={onClick}
      style={{
        border: `1px solid ${s.border}`,
        background: s.bg,
        borderRadius: 12,
        padding: "14px 15px",
        display: "flex",
        gap: 13,
        alignItems: "flex-start",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: `1px solid ${s.dotBorder}`,
          flex: "none",
          marginTop: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, display: "block" }} />
      </span>
      <span>
        <span style={{ display: "block", font: "400 15px/1.3 'Helvetica Neue',Helvetica,sans-serif", color: "#F2F0EC" }}>
          {title}
        </span>
        <span
          style={{
            display: "block",
            font: "400 12.5px/1.45 'Helvetica Neue',Helvetica,sans-serif",
            color: "rgba(242,240,236,.48)",
            marginTop: 4,
          }}
        >
          {blurb}
        </span>
      </span>
    </div>
  );
}

export function ConnectScreen() {
  const navigate = useNavigate();
  const { session, cameraStatus, updateSession, setDeliveryMode, startSession } = useSession();
  const meta = CAMERA_STATE_META[cameraStatus.state] ?? CAMERA_STATE_META.not_configured;
  const info = cameraStatus.info;

  const readyLine =
    session.deliveryMode === "hotspot" ? "OFFLINE READY · 0 QUEUED" : "CLOUD · UPLOADS WHEN SIGNAL RETURNS";

  async function onStart() {
    await startSession();
    navigate("/feed");
  }

  return (
    <div style={{ flex: 1, background: "#0B0B0C", padding: "calc(env(safe-area-inset-top) + 16px) 24px 0", display: "flex", flexDirection: "column", gap: 16, overflow: "hidden" }}>
      <img
        src="/assets/jn-logo.png"
        alt="Jessica Nona Photography"
        style={{ width: 120, alignSelf: "center", filter: "contrast(1.35)", mixBlendMode: "screen", opacity: 0.92 }}
      />

      <div style={{ border: "1px solid rgba(242,240,236,.13)", borderRadius: 14, padding: "16px 17px", background: "#131315", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ font: "400 17px/1.2 'Helvetica Neue',Helvetica,sans-serif", color: "#F2F0EC" }}>
            {info?.productName ?? "Canon Camera"}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.dot, display: "block" }} />
            <span style={{ font: "500 10px/1 'IBM Plex Mono',monospace", color: meta.color, letterSpacing: ".1em" }}>
              {meta.label}
            </span>
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px", font: "400 10.5px/1.5 'IBM Plex Mono',monospace", color: "rgba(242,240,236,.42)", letterSpacing: ".05em" }}>
          <div>SERIAL<div style={{ color: "#F2F0EC" }}>{info?.serial ?? "—"}</div></div>
          <div>BATTERY<div style={{ color: "#F2F0EC" }}>{info?.batteryLevel != null ? `${info.batteryLevel}%` : "—"}</div></div>
          <div>CARD<div style={{ color: "#F2F0EC" }}>{info?.cardFreeGb != null ? `${info.cardFreeGb} GB FREE` : "—"}</div></div>
          <div>API<div style={{ color: "#F2F0EC" }}>{info?.apiVersion ? `CCAPI ${info.apiVersion}` : "—"}</div></div>
        </div>
        {cameraStatus.state === "not_configured" && (
          <div style={{ font: "400 12px/1.5 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(242,240,236,.42)" }}>
            No camera paired yet — add its IP under Setup once it's on this network, or start the session and shoot into the FTP/hotspot queue in the meantime.
          </div>
        )}
        {cameraStatus.state === "dropped" && (
          <div style={{ font: "400 12px/1.5 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(242,240,236,.42)" }}>
            Keep shooting — the card is still recording. This app is only a delivery layer.
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ font: "500 10px/1 'IBM Plex Mono',monospace", color: "rgba(242,240,236,.4)", letterSpacing: ".13em" }}>
          DELIVERY FOR THIS SESSION
        </div>
        <DeliveryOption
          active={session.deliveryMode === "hotspot"}
          title="Local hotspot"
          blurb="Guests join JN-STUDIO. Works with no internet."
          onClick={() => setDeliveryMode("hotspot")}
        />
        <DeliveryOption
          active={session.deliveryMode === "cloud"}
          title="Cloud sync"
          blurb="Queues on device, uploads when signal returns."
          onClick={() => setDeliveryMode("cloud")}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ font: "500 10px/1 'IBM Plex Mono',monospace", color: "rgba(242,240,236,.4)", letterSpacing: ".13em" }}>
          SESSION
        </div>
        <input
          defaultValue={session.name}
          onBlur={(e) => e.target.value !== session.name && updateSession({ name: e.target.value })}
          style={{
            border: "none",
            borderBottom: "1px solid rgba(242,240,236,.18)",
            paddingBottom: 10,
            background: "transparent",
            font: "400 16px/1.2 'Helvetica Neue',Helvetica,sans-serif",
            color: "#F2F0EC",
            outline: "none",
          }}
        />
      </div>

      <div style={{ flex: "none", padding: "16px 0 max(34px, env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", gap: 12, marginTop: "auto" }}>
        <div
          onClick={onStart}
          style={{ background: "#F2F0EC", color: "#0B0B0C", borderRadius: 13, height: 52, display: "flex", alignItems: "center", justifyContent: "center", font: "500 16px/1 'Helvetica Neue',Helvetica,sans-serif", cursor: "pointer" }}
        >
          Start session
        </div>
        <div style={{ textAlign: "center", font: "400 10px/1 'IBM Plex Mono',monospace", color: "rgba(242,240,236,.32)", letterSpacing: ".08em" }}>
          {readyLine}
        </div>
      </div>
    </div>
  );
}
