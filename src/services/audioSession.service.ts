import { canListen } from "./audioAuthorization.service";
import { sessions } from "../repositories/session.repository";
import { AuthorizationError, AppError, NotFoundError } from "../utils/errors";
import { emit } from "../websocket/connection.manager";

const REASON: Record<string, string> = {
  AUDIO_PERMISSION_DENIED:
    "This friend has not allowed you to hear their audio.",
  AUDIO_OWNER_OFFLINE: "This friend is offline. Ask them to open Orbit.",
  AUDIO_OWNER_BUSY: "This friend is already in a live audio session.",
  AUDIO_LISTENER_BUSY:
    "You are already in a live audio session. Stop it first, then try again.",
  NOT_FRIENDS: "You can only hear audio from friends.",
  USER_NOT_FOUND: "User not found.",
};

const fail = (x: any) => {
  throw new AppError(
    403,
    x.code || "AUDIO_SESSION_UNAUTHORIZED",
    REASON[x.code] || x.message || "Audio session authorization failed",
  );
};

export const audioSessionService = {
  create: async (me: string, x: any) => {
    if (me !== x.listenerUserId) throw new AuthorizationError();
    // Clear any open session between this pair, plus other stuck pending ones.
    await sessions.clearBetween(me, x.ownerUserId);
    await sessions.clearPendingFor(me);
    await sessions.clearPendingFor(x.ownerUserId);
    const a = await canListen(me, x.ownerUserId);
    if (!a.ok) fail(a);
    const session: any = await sessions.create({
      ownerUserId: x.ownerUserId,
      listenerUserId: me,
      status: "requesting",
    });
    emit(String(x.ownerUserId), "audio.session.requested", {
      sessionId: String(session._id),
      ownerUserId: String(x.ownerUserId),
      listenerUserId: me,
    });
    return session;
  },
  active: (id: string) => sessions.activeFor(id),
  transition: async (me: string, id: string, status: string) => {
    const s: any = await sessions.find(id);
    if (!s)
      throw new NotFoundError("AUDIO_SESSION_NOT_FOUND", "Session not found");
    const owner = String(s.ownerUserId) === me,
      listener = String(s.listenerUserId) === me;
    if (!owner && !listener) throw new AuthorizationError();
    if (status === "connecting") {
      if (!owner) throw new AuthorizationError();
      // Exclude this session — otherwise accept always looks "already paired".
      const a = await canListen(String(s.listenerUserId), me, {
        excludeSessionId: id,
      });
      if (!a.ok) fail(a);
      if (s.status !== "requesting")
        throw new AppError(409, "AUDIO_SESSION_INVALID_STATE", "Invalid state");
      s.status = "connecting";
    } else if (status === "rejected") {
      if (!owner || s.status !== "requesting")
        throw new AppError(409, "AUDIO_SESSION_INVALID_STATE", "Invalid state");
      s.status = "rejected";
      s.endedAt = new Date();
      s.endedBy = me;
    } else if (status === "active") {
      if (!owner && !listener) throw new AuthorizationError();
      if (s.status !== "connecting" && s.status !== "requesting")
        throw new AppError(409, "AUDIO_SESSION_INVALID_STATE", "Invalid state");
      s.status = "active";
      s.startedAt = new Date();
    } else throw new AppError(422, "VALIDATION_ERROR", "Unsupported status");
    await s.save();
    const peer =
      String(s.ownerUserId) === me
        ? String(s.listenerUserId)
        : String(s.ownerUserId);
    emit(peer, "audio.session.updated", {
      sessionId: String(s._id),
      status: s.status,
      ownerUserId: String(s.ownerUserId),
      listenerUserId: String(s.listenerUserId),
    });
    return s;
  },
  stop: async (me: string, id: string) => {
    const s: any = await sessions.find(id);
    if (!s)
      throw new NotFoundError("AUDIO_SESSION_NOT_FOUND", "Session not found");
    if (String(s.ownerUserId) !== me && String(s.listenerUserId) !== me)
      throw new AuthorizationError();
    if (
      ["stopped", "rejected", "failed", "permissionRevoked"].includes(s.status)
    )
      return s;
    s.status = "stopped";
    s.endedAt = new Date();
    s.endedBy = me;
    await s.save();
    const peer =
      String(s.ownerUserId) === me
        ? String(s.listenerUserId)
        : String(s.ownerUserId);
    emit(peer, "audio.session.updated", {
      sessionId: String(s._id),
      status: "stopped",
      ownerUserId: String(s.ownerUserId),
      listenerUserId: String(s.listenerUserId),
    });
    return s;
  },
};
