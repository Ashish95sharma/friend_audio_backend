import { users } from "../repositories/user.repository";
import { friends } from "../repositories/friend.repository";
import { permissions } from "../repositories/permission.repository";
import { sessions } from "../repositories/session.repository";
import { connections } from "../websocket/connection.manager";

export async function canListen(listenerUserId: string, ownerUserId: string) {
  if (listenerUserId === ownerUserId)
    return { ok: false, code: "AUDIO_PERMISSION_DENIED" };
  const [l, o] = await Promise.all([
    users.findById(listenerUserId),
    users.findById(ownerUserId),
  ]);
  if (!l || !o) return { ok: false, code: "USER_NOT_FOUND" };
  if (!(await friends.exists(listenerUserId, ownerUserId)))
    return { ok: false, code: "NOT_FRIENDS" };
  const p = await permissions.get(ownerUserId, listenerUserId);
  if (!p?.isAllowed) return { ok: false, code: "AUDIO_PERMISSION_DENIED" };

  // Live socket wins; DB flag is the fallback after Render restarts.
  const online = connections.has(ownerUserId) || !!o.isOnline;
  if (!online) return { ok: false, code: "AUDIO_OWNER_OFFLINE" };

  if (await sessions.activeFor(ownerUserId))
    return { ok: false, code: "AUDIO_OWNER_BUSY" };
  if (await sessions.activeFor(listenerUserId))
    return { ok: false, code: "AUDIO_LISTENER_BUSY" };
  return { ok: true, owner: o, listener: l };
}
