import { WebSocket } from "ws";
const map = new Map<string, Set<WebSocket>>();
export const connections = {
  add: (id: string, ws: WebSocket) => {
    if (!map.has(id)) map.set(id, new Set());
    map.get(id)!.add(ws);
  },
  remove: (id: string, ws: WebSocket) => {
    const s = map.get(id);
    if (!s) return 0;
    s.delete(ws);
    if (!s.size) map.delete(id);
    return s.size;
  },
  send: (id: string, msg: any) => {
    for (const ws of map.get(id) || [])
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
  },
  has: (id: string) => !!map.get(id)?.size,
};
