import { User } from "../models/User";
import { sessions } from "../repositories/session.repository";
export const presenceService = {
  online: (id: string) =>
    User.findByIdAndUpdate(id, { $set: { isOnline: true } }),
  offline: async (id: string) => {
    await User.findByIdAndUpdate(id, {
      $set: { isOnline: false, lastSeenAt: new Date() },
    });
    const s: any = await sessions.activeFor(id);
    if (s && String(s.ownerUserId) === id) {
      s.status = "stopped";
      s.endedAt = new Date();
      s.endedBy = id;
      await s.save();
    }
  },
};
