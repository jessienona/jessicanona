import { useLocation, useNavigate } from "react-router-dom";
import { dark } from "@tether/shared";
import { capWidth } from "../lib/layoutWidth.js";

const TABS = [
  { key: "feed", path: "/feed", label: "FEED", shape: "square" },
  { key: "cull", path: "/cull", label: "CULL", shape: "circle" },
  { key: "qr", path: "/qr", label: "SHARE", shape: "outline-square" },
  { key: "setup", path: "/setup", label: "SETUP", shape: "diamond" },
];

function TabGlyph({ shape, color }) {
  const base = { width: 13, height: 13, display: "block" };
  if (shape === "square") return <span style={{ ...base, borderRadius: 2, background: color }} />;
  if (shape === "circle") return <span style={{ ...base, borderRadius: "50%", border: `1px solid ${color}` }} />;
  if (shape === "diamond")
    return <span style={{ ...base, borderRadius: 2, border: `1px solid ${color}`, transform: "rotate(45deg)" }} />;
  return <span style={{ ...base, border: `1px solid ${color}` }} />;
}

export function TabBar({ wide = false }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{ flex: "none", borderTop: `1px solid ${dark.hairline}`, background: dark.shellBg }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          padding: "13px 0 max(30px, env(safe-area-inset-bottom))",
          ...capWidth(wide),
        }}
      >
        {TABS.map((tab) => {
          const active = pathname === tab.path;
          const color = active ? dark.ink : "rgba(242,240,236,.45)";
          return (
            <div
              key={tab.key}
              onClick={() => navigate(tab.path)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, cursor: "pointer" }}
            >
              <TabGlyph shape={tab.shape} color={color} />
              <span style={{ font: "500 9.5px/1 'IBM Plex Mono',monospace", color, letterSpacing: ".08em" }}>
                {tab.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
