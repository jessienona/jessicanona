import { Navigate, Route, Routes } from "react-router-dom";
import { GuestProvider } from "./context/GuestContext.jsx";
import { Layout } from "./components/Layout.jsx";
import { LandingScreen } from "./screens/LandingScreen.jsx";
import { GalleryScreen } from "./screens/GalleryScreen.jsx";
import { FindScreen } from "./screens/FindScreen.jsx";
import { PhotoScreen } from "./screens/PhotoScreen.jsx";

function GuestRoutes() {
  return (
    <GuestProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<LandingScreen />} />
          <Route path="gallery" element={<GalleryScreen />} />
          <Route path="find" element={<FindScreen />} />
          <Route path="photo/:id" element={<PhotoScreen />} />
        </Route>
      </Routes>
    </GuestProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/g/:slug/*" element={<GuestRoutes />} />
      <Route
        path="*"
        element={
          <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F4F1EC", padding: 34, textAlign: "center" }}>
            <div style={{ font: "400 14px/1.6 'Helvetica Neue',Helvetica,sans-serif", color: "rgba(26,25,24,.55)" }}>
              Scan the QR code the photographer is showing to open a gallery.
            </div>
          </div>
        }
      />
    </Routes>
  );
}
