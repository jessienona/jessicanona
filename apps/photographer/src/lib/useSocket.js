import { useEffect, useRef } from "react";

/** Subscribes to the server's session-scoped WebSocket feed and calls
 * onMessage({type, payload}) for every event. Reconnects on drop. */
export function useSocket(sessionId, onMessage) {
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    if (!sessionId) return;
    let socket;
    let closed = false;
    let retryTimer;

    function connect() {
      const proto = location.protocol === "https:" ? "wss:" : "ws:";
      socket = new WebSocket(`${proto}//${location.host}/ws`);
      socket.addEventListener("open", () => {
        socket.send(JSON.stringify({ type: "subscribe", sessionId }));
      });
      socket.addEventListener("message", (e) => {
        try {
          handlerRef.current(JSON.parse(e.data));
        } catch {
          /* ignore malformed frame */
        }
      });
      socket.addEventListener("close", () => {
        if (!closed) retryTimer = setTimeout(connect, 1500);
      });
    }
    connect();

    return () => {
      closed = true;
      clearTimeout(retryTimer);
      socket?.close();
    };
  }, [sessionId]);
}
