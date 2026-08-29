import { layout } from "@tether/shared";

export function Toast({ toast, bottom = 120, wide = false }) {
  if (!toast) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 36px)",
        maxWidth: (wide ? layout.wide : layout.narrow) - 36,
        bottom,
        background: "#1A1918",
        borderRadius: 13,
        padding: "15px 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 12px 30px rgba(0,0,0,.3)",
        zIndex: 20,
      }}
    >
      <span style={{ font: "400 13.5px/1.4 'Helvetica Neue',Helvetica,sans-serif", color: "#F4F1EC" }}>{toast.text}</span>
      <span style={{ font: "500 10px/1 'IBM Plex Mono',monospace", color: "oklch(0.8 0.13 145)", letterSpacing: ".1em" }}>
        {toast.tag}
      </span>
    </div>
  );
}
