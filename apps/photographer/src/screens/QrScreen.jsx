import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext.jsx";
import { api } from "../lib/api.js";
import { accent } from "@tether/shared";

export function QrScreen() {
  const navigate = useNavigate();
  const { session, photos } = useSession();
  const [qr, setQr] = useState(null);

  useEffect(() => {
    api.qr(session.id).then(setQr);
  }, [session.id, session.deliveryMode]);

  const modeLine = session.deliveryMode === "hotspot" ? "NO INTERNET NEEDED" : "LINK STAYS LIVE AFTER TONIGHT";
  const joinLine = session.deliveryMode === "hotspot" ? "JOIN WI-FI · JN-STUDIO" : qr?.joinUrl?.replace(/^https?:\/\//, "") ?? "";

  return (
    <div
      onClick={() => navigate("/feed")}
      style={{ flex: 1, background: "#0B0B0C", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28, padding: 30, cursor: "pointer" }}
    >
      <img src="/assets/jn-logo.png" alt="Jessica Nona Photography" style={{ width: 120, filter: "contrast(1.35)", mixBlendMode: "screen", opacity: 0.9 }} />
      <div style={{ textAlign: "center" }}>
        <div style={{ font: "300 34px/1.15 'Cormorant Garamond',serif", color: "#F2F0EC" }}>{session.name}</div>
        <div style={{ font: "400 13px/1.5 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(242,240,236,.5)", marginTop: 9 }}>
          Scan for every photo from tonight
        </div>
      </div>
      <div style={{ background: "#F2F0EC", padding: 16, borderRadius: 12, width: 190, height: 190, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {qr ? <img src={qr.dataUrl} alt="QR code" width={190} height={190} /> : null}
      </div>
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ font: "500 10.5px/1 'IBM Plex Mono',monospace", color: "rgba(242,240,236,.45)", letterSpacing: ".12em" }}>{modeLine}</div>
        <div style={{ font: "500 12px/1.5 'IBM Plex Mono',monospace", color: "#F2F0EC", letterSpacing: ".08em" }}>{joinLine}</div>
      </div>
      <div style={{ font: "500 10px/1 'IBM Plex Mono',monospace", color: accent.liveText, letterSpacing: ".1em" }}>
        {photos.length.toLocaleString()} PHOTOS · UPDATING LIVE
      </div>
      <div style={{ font: "400 11.5px/1 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(242,240,236,.3)", position: "absolute", bottom: 38 }}>
        Tap anywhere to exit
      </div>
    </div>
  );
}
