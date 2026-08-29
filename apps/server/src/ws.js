import { WebSocketServer } from "ws";

/** Tiny pub/sub over WebSocket, rooms scoped by session id ("*" = all sessions). */
class Hub {
  constructor() {
    this.clients = new Set();
  }

  attach(server) {
    this.wss = new WebSocketServer({ server, path: "/ws" });
    this.wss.on("connection", (socket) => {
      const client = { socket, sessionId: null };
      this.clients.add(client);
      socket.on("message", (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          if (msg.type === "subscribe") client.sessionId = msg.sessionId;
        } catch {
          /* ignore malformed control frames */
        }
      });
      socket.on("close", () => this.clients.delete(client));
    });
    return this.wss;
  }

  broadcast(sessionId, type, payload) {
    const msg = JSON.stringify({ type, payload });
    for (const client of this.clients) {
      if (client.sessionId && client.sessionId !== sessionId) continue;
      if (client.socket.readyState === client.socket.OPEN) client.socket.send(msg);
    }
  }
}

export const hub = new Hub();
