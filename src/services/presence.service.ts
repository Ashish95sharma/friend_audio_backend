import { User } from "../models/User";
import { sessions } from "../repositories/session.repository";
import { connections } from "../websocket/connection.manager";

export const presenceService = {
  online: (id: string) =>
    User.findByIdAndUpdate(
      id,
      { $set: { isOnline: true } },
      { new: true },
    ),
  offline: async (id: string) => {
    // Keep online if another device still has an open socket.
    if (connections.has(id)) return;
    const lastSeenAt = new Date();
    await User.findByIdAndUpdate(id, {
      $set: { isOnline: false, lastSeenAt },
    });
    const s: any = await sessions.activeFor(id);
    if (s && String(s.ownerUserId) === id) {
      s.status = "stopped";
      s.endedAt = new Date();
      s.endedBy = id;
      await s.save();
    }
    return lastSeenAt;
  },
};
