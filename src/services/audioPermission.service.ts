import { permissions } from "../repositories/permission.repository";
import { friends } from "../repositories/friend.repository";
import { AuthorizationError, ConflictError } from "../utils/errors";
import { sessions } from "../repositories/session.repository";
import { emit } from "../websocket/connection.manager";

const permissionDto = (p: any) => ({
  id: String(p._id),
  ownerUserId: String(p.ownerUserId?._id ?? p.ownerUserId),
  listenerUserId: String(p.listenerUserId?._id ?? p.listenerUserId),
  isAllowed: !!p.isAllowed,
  updatedAt: p.updatedAt,
});

export const audioPermissionService = {
  list: async (id: string) => {
    const docs: any[] = await permissions.forOwner(id);
    return docs.map(permissionDto);
  },
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
    const dto = permissionDto(p);
    emit(x.listenerUserId, "audio.permission.changed", dto);
    return dto;
  },
};
