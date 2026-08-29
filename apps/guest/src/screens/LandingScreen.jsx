import { useNavigate } from "react-router-dom";
import { useGuest } from "../context/GuestContext.jsx";

export function LandingScreen() {
  const navigate = useNavigate();
  const { slug, session } = useGuest();

  if (!session) return null;

  return (
    <>
      <div style={{ flex: 1, background: "#F4F1EC", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26, padding: 34, textAlign: "center" }}>
        <img src="/assets/jn-logo.png" alt="Jessica Nona Photography" style={{ width: 126, filter: "contrast(1.35) invert(1)", mixBlendMode: "multiply", opacity: 0.9 }} />
        <div style={{ width: 32, height: 1, background: "rgba(26,25,24,.22)" }} />
        <div>
          <div style={{ font: "300 38px/1.15 'Cormorant Garamond',serif", color: "#1A1918" }}>{session.name}</div>
          <div style={{ font: "400 11.5px/1 'IBM Plex Mono',monospace", color: "rgba(26,25,24,.45)", letterSpacing: ".14em", marginTop: 14 }}>
            {session.eventDate.toUpperCase()}
          </div>
        </div>
        <div style={{ font: "400 14px/1.65 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(26,25,24,.6)", maxWidth: 250 }}>
          {session.photoCount.toLocaleString()} photos so far, arriving as they are taken. Download anything you like at full resolution.
        </div>
      </div>
      <div style={{ flex: "none", background: "#F4F1EC", padding: "0 28px max(38px, env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          onClick={() => navigate(`/g/${slug}/gallery`)}
          style={{ height: 54, borderRadius: 13, background: "#1A1918", color: "#F4F1EC", display: "flex", alignItems: "center", justifyContent: "center", font: "500 16px/1 'Helvetica Neue',Helvetica,sans-serif", cursor: "pointer" }}
        >
          Enter the gallery
        </div>
        <div
          onClick={() => navigate(`/g/${slug}/find`)}
          style={{ textAlign: "center", font: "400 14px/1 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(26,25,24,.5)", textDecoration: "underline", textUnderlineOffset: 4, cursor: "pointer" }}
        >
          Find my photos
        </div>
      </div>
    </>
  );
}
