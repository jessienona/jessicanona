import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "node:http";
import { hub } from "./ws.js";
import { photographerRouter } from "./routes/photographer.js";
import { guestRouter } from "./routes/guest.js";
import { startFtpServer } from "./ftpServer.js";
import { startIncomingWatcher } from "./watchIncoming.js";
import { startCloudSyncWorker } from "./cloudSync.js";
import "./db.js"; // ensure schema exists before anything else touches it

const PORT = Number(process.env.PORT || 4000);

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api", photographerRouter);
app.use("/api/guest", guestRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "internal error" });
});

const server = http.createServer(app);
hub.attach(server);

server.listen(PORT, () => {
  console.log(`[server] http+ws listening on :${PORT}`);
});

startFtpServer();
startIncomingWatcher();
startCloudSyncWorker();
