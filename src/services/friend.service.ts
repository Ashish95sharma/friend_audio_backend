import { friends } from "../repositories/friend.repository";
import { users } from "../repositories/user.repository";
import {
  ConflictError,
  NotFoundError,
  AuthorizationError,
} from "../utils/errors";
import { permissions } from "../repositories/permission.repository";
import { sessions } from "../repositories/session.repository";
import { connections, emit } from "../websocket/connection.manager";

const requestDto = async (request: any, fallbackFromId?: string) => {
  const sender: any = request.fromUserId;
  const senderId = String(sender?._id ?? sender ?? fallbackFromId ?? "");
  const user: any = sender?.username
    ? sender
    : await users.findById(senderId);
  return {
    id: String(request._id),
    fromUserId: senderId,
    fromUsername: user?.username ?? "Unknown",
    fromDisplayName: user?.displayName ?? user?.username ?? "Unknown",
    avatarUrl: user?.avatarUrl ?? null,
    status: request.status,
    createdAt: request.createdAt,
  };
};

export const friendService = {
  send: async (me: string, to: string) => {
    if (me === to)
      throw new ConflictError("CANNOT_FRIEND_SELF", "Cannot friend yourself");
    if (!(await users.findById(to)))
      throw new NotFoundError("USER_NOT_FOUND", "User not found");
    if (await friends.exists(me, to))
      throw new ConflictError("ALREADY_FRIENDS", "Already friends");
    const pending = await friends.pendingBetween(me, to);
    if (pending)
      throw new ConflictError(
        "FRIEND_REQUEST_EXISTS",
        "Pending request exists",
      );
    const request = await friends.request(me, to);
    const dto = await requestDto(request, me);
    emit(to, "friend.request.received", dto);
    return dto;
  },
  requests: async (id: string, direction = "incoming") => {
    if (direction === "outgoing") {
      const requests: any[] = await friends.sentRequestsFor(id);
      return requests.map((request) => ({
        id: String(request._id),
        fromUserId: id,
        toUserId: String(request.toUserId),
        status: request.status,
        createdAt: request.createdAt,
      }));
    }
    const requests: any[] = await friends.requestsFor(id);
    return Promise.all(requests.map((request) => requestDto(request)));
  },
  accept: async (me: string, id: string) => {
    const r: any = await friends.findRequest(id);
    if (!r || r.status !== "pending")
      throw new NotFoundError("FRIEND_REQUEST_NOT_FOUND", "Request not found");
    if (String(r.toUserId) !== me) throw new AuthorizationError();
    const senderId = String(r.fromUserId);
    await friends.create(senderId, me);
    r.status = "accepted";
    await r.save();
    const dto = await requestDto(r, senderId);
    emit(senderId, "friend.request.accepted", { ...dto, userId: me });
    return dto;
  },
  reject: async (me: string, id: string) => {
    const r: any = await friends.findRequest(id);
    if (!r || r.status !== "pending")
      throw new NotFoundError("FRIEND_REQUEST_NOT_FOUND", "Request not found");
    if (String(r.toUserId) !== me) throw new AuthorizationError();
    const senderId = String(r.fromUserId);
    r.status = "rejected";
    await r.save();
    const dto = await requestDto(r, senderId);
    emit(senderId, "friend.request.rejected", dto);
    return dto;
  },
  list: async (me: string) => {
    const fs: any[] = await friends.list(me);
    return Promise.all(
      fs.map(async (f) => {
        const uid = String(f.userA) === me ? String(f.userB) : String(f.userA);
        const u: any = await users.findById(uid);
        const p = await permissions.get(uid, me);
        const live = connections.has(uid);
        return {
          id: uid,
          userId: uid,
          username: u.username,
          displayName: u.displayName,
          isOnline: live || !!u?.isOnline,
          lastSeenAt: u?.lastSeenAt ?? null,
          canHearAudio: !!p?.isAllowed,
          friendsSince: f.createdAt,
        };
      }),
    );
  },
  remove: async (me: string, other: string) => {
    if (!(await friends.remove(me, other)))
      throw new NotFoundError("NOT_FRIENDS", "Not friends");
    const ss: any[] = await sessions.activeInvolving(me, other);
    for (const s of ss) {
      s.status = "stopped";
      s.endedAt = new Date();
      s.endedBy = me;
      await s.save();
    }
    return {};
  },
};
