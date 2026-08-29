import { Navigate, Route, Routes } from "react-router-dom";
import { SessionProvider, useSession } from "./context/SessionContext.jsx";
import { Layout } from "./components/Layout.jsx";
import { ConnectScreen } from "./screens/ConnectScreen.jsx";
import { FeedScreen } from "./screens/FeedScreen.jsx";
import { PhotoDetailScreen } from "./screens/PhotoDetailScreen.jsx";
import { CullScreen } from "./screens/CullScreen.jsx";
import { QrScreen } from "./screens/QrScreen.jsx";
import { SetupScreen } from "./screens/SetupScreen.jsx";

function Home() {
  const { session } = useSession();
  if (!session) return null;
  return <Navigate to={session.status === "connect" ? "/connect" : "/feed"} replace />;
}

export default function App() {
  return (
    <SessionProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="connect" element={<ConnectScreen />} />
          <Route path="feed" element={<FeedScreen />} />
          <Route path="photo/:id" element={<PhotoDetailScreen />} />
          <Route path="cull" element={<CullScreen />} />
          <Route path="qr" element={<QrScreen />} />
          <Route path="setup" element={<SetupScreen />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </SessionProvider>
  );
}
