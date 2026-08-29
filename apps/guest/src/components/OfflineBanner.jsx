import { useOnlineStatus } from "../lib/useOnlineStatus.js";

export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div
      style={{
        flex: "none",
        padding: "9px 22px",
        paddingTop: "calc(9px + env(safe-area-inset-top))",
        background: "#1A1918",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "oklch(0.72 0.14 25)", display: "block" }} />
      <span style={{ font: "500 10.5px/1 'IBM Plex Mono',monospace", color: "#F4F1EC", letterSpacing: ".08em" }}>
        OFFLINE — SHOWING LAST SYNCED GALLERY
      </span>
    </div>
  );
}
