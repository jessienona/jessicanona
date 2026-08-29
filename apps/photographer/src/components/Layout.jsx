import { Outlet, useLocation } from "react-router-dom";
import { dark } from "@tether/shared";
import { TabBar } from "./TabBar.jsx";
import { Toast } from "./Toast.jsx";
import { useSession } from "../context/SessionContext.jsx";
import { capWidth, isWideRoute } from "../lib/layoutWidth.js";

const TABBED_ROUTES = [/^\/feed$/, /^\/photo\//, /^\/cull$/, /^\/setup$/];

function toastBottomFor(pathname) {
  if (pathname.startsWith("/photo/")) return 196;
  if (pathname === "/cull") return 190;
  return 120;
}

export function Layout() {
  const { pathname } = useLocation();
  const { toast, session } = useSession();
  const showTabs = TABBED_ROUTES.some((re) => re.test(pathname));
  const wide = isWideRoute(pathname);

  if (!session) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: dark.shellBg,
          color: dark.inkFaint,
          font: "400 13px/1 'IBM Plex Mono',monospace",
        }}
      >
        Connecting…
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: dark.shellBg }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", ...capWidth(wide) }}>
        <Outlet />
      </div>
      {showTabs && <TabBar wide={wide} />}
      <Toast toast={toast} bottom={toastBottomFor(pathname)} wide={wide} />
    </div>
  );
}
