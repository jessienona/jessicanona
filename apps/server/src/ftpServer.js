import { FtpSrv } from "ftp-srv";
import { INCOMING_DIR } from "./db.js";

const FTP_PORT = Number(process.env.FTP_PORT || 2121);
const FTP_HOST = process.env.FTP_HOST || "0.0.0.0";
const FTP_USER = process.env.FTP_USER || "r5";
const FTP_PASS = process.env.FTP_PASS || "tether";

/**
 * A real FTP server the Canon R5 can be pointed at directly (Menu > Network
 * settings > FTP transfer, per chats/chat1.md's "lower-effort alternative").
 * Every file it receives lands in data/incoming and is picked up by
 * watchIncoming.js — the same path the simulate-camera script exercises.
 */
export function startFtpServer() {
  const ftpServer = new FtpSrv({
    url: `ftp://${FTP_HOST}:${FTP_PORT}`,
    pasv_url: process.env.FTP_PASV_URL || FTP_HOST,
    pasv_min: Number(process.env.FTP_PASV_MIN || 2122),
    pasv_max: Number(process.env.FTP_PASV_MAX || 2130),
    anonymous: false,
    greeting: ["Tether ingest — point the R5's FTP transfer here."],
  });

  ftpServer.on("login", ({ username, password }, resolve, reject) => {
    if (username === FTP_USER && password === FTP_PASS) {
      resolve({ root: INCOMING_DIR });
    } else {
      reject(new Error("Bad username or password"));
    }
  });

  ftpServer.on("client-error", ({ context, error }) => {
    console.error(`[ftp] client error (${context}):`, error.message);
  });

  ftpServer.listen().then(() => {
    console.log(`[ftp] listening on ftp://${FTP_HOST}:${FTP_PORT} (user "${FTP_USER}")`);
  });

  return ftpServer;
}
