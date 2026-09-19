import { WebSocket } from "ws";
import { friends } from "../repositories/friend.repository";

const map = new Map<string, Set<WebSocket>>();

export function emit(userId: string, type: string, payload: Record<string, unknown> = {}) {
  connections.send(userId, {
    type,
    payload,
    at: new Date().toISOString(),
  });
}

export async function emitToFriends(
  userId: string,
  type: string,
  payload: Record<string, unknown>,
) {
  const list: any[] = await friends.list(userId);
  for (const friendship of list) {
    const other =
      String(friendship.userA) === userId
        ? String(friendship.userB)
        : String(friendship.userA);
    emit(other, type, payload);
  }
}

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
