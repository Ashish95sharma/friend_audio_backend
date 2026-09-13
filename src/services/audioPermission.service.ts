import { permissions } from "../repositories/permission.repository";
import { friends } from "../repositories/friend.repository";
import { AuthorizationError, ConflictError } from "../utils/errors";
import { sessions } from "../repositories/session.repository";
export const audioPermissionService = {
  list: (id: string) => permissions.forOwner(id),
  set: async (me: string, x: any) => {
    if (x.ownerUserId !== me)
      throw new AuthorizationError("Only owner can change permission");
    if (!(await friends.exists(me, x.listenerUserId)))
      throw new ConflictError("NOT_FRIENDS", "Users must be friends");
    const p = await permissions.upsert(me, x.listenerUserId, x.isAllowed);
    if (!x.isAllowed) {
      const s: any = await sessions.activeBetween(me, x.listenerUserId);
      if (s) {
        s.status = "permissionRevoked";
        s.endedAt = new Date();
        s.endedBy = me;
        await s.save();
      }
    }
    return p;
  },
};
