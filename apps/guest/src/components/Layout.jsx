import { Outlet, useLocation } from "react-router-dom";
import { Toast } from "./Toast.jsx";
import { OfflineBanner } from "./OfflineBanner.jsx";
import { useGuest } from "../context/GuestContext.jsx";
import { capWidth, isWideRoute } from "../lib/layoutWidth.js";

function toastBottomFor(pathname) {
  if (pathname.endsWith("/gallery")) return 100;
  if (pathname.includes("/photo/")) return 210;
  return 120;
}

export function Layout() {
  const { pathname } = useLocation();
  const { toast, notFound } = useGuest();
  const wide = isWideRoute(pathname);

  if (notFound) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#F4F1EC", padding: 34, textAlign: "center", gap: 10 }}>
        <div style={{ font: "300 30px/1.2 'Cormorant Garamond',serif", color: "#1A1918" }}>This link has ended</div>
        <div style={{ font: "400 14px/1.6 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(26,25,24,.55)", maxWidth: 280 }}>
          The photographer has archived this session, or the link is wrong. Ask them for a fresh QR code.
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "#F4F1EC" }}>
      <OfflineBanner />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", ...capWidth(wide) }}>
        <Outlet />
      </div>
      <Toast toast={toast} bottom={toastBottomFor(pathname)} wide={wide} />
    </div>
  );
}
