import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { env } from "../config/env";
import { verifyAccessToken } from "../utils/jwt";
import { connections } from "./connection.manager";
import { presenceService } from "../services/presence.service";
import { signalingService } from "../services/signaling.service";
import { audioSessionService } from "../services/audioSession.service";
export function attachWebSocket(server: Server) {
  const wss = new WebSocketServer({
    server,
    path: env.WS_PATH,
    maxPayload: 64 * 1024,
  });
  wss.on("connection", async (ws, req) => {
    try {
      const token = new URL(req.url || "", "http://localhost").searchParams.get(
        "token",
      );
      if (!token) throw new Error();
      const a = verifyAccessToken(token);
      const id = a.userId;
      connections.add(id, ws);
      await presenceService.online(id);
      ws.on("message", async (raw) => {
        try {
          const m = JSON.parse(String(raw));
          if (!m.type || !m.sessionId) throw new Error();
          const s: any = await signalingService.verify(id, m.sessionId, m.type);
          if (m.type === "audio.session.started")
            await audioSessionService.transition(id, m.sessionId, "active");
          if (["audio.offer", "audio.ice_candidate"].includes(m.type))
            connections.send(String(s.ownerUserId), m);
          else if (m.type === "audio.answer")
            connections.send(String(s.listenerUserId), m);
          else if (m.type === "audio.session.started")
            connections.send(
              String(s.ownerUserId) === id
                ? String(s.listenerUserId)
                : String(s.ownerUserId),
              m,
            );
        } catch {
          ws.send(
            JSON.stringify({
              type: "error",
              payload: { code: "WS_INVALID_EVENT" },
            }),
          );
        }
      });
      ws.on("close", async () => {
        if (!connections.remove(id, ws)) await presenceService.offline(id);
      });
      ws.on("error", () => {});
    } catch {
      ws.close(1008, "Unauthorized");
    }
  });
  return wss;
}
