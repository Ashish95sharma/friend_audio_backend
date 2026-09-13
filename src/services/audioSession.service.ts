import { canListen } from "./audioAuthorization.service";
import { sessions } from "../repositories/session.repository";
import { AuthorizationError, AppError, NotFoundError } from "../utils/errors";
const fail = (x: any) => {
  throw new AppError(403, x.code, "Audio session authorization failed");
};
export const audioSessionService = {
  create: async (me: string, x: any) => {
    if (me !== x.listenerUserId) throw new AuthorizationError();
    const a = await canListen(me, x.ownerUserId);
    if (!a.ok) fail(a);
    return sessions.create({
      ownerUserId: x.ownerUserId,
      listenerUserId: me,
      status: "requesting",
    });
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
      const a = await canListen(String(s.listenerUserId), me);
      if (!a.ok) fail(a);
      if (s.status !== "requesting")
        throw new AppError(409, "AUDIO_SESSION_INVALID_STATE", "Invalid state");
      s.status = "connecting";
    } else if (status === "rejected") {
      if (!owner || s.status !== "requesting")
        throw new AppError(409, "AUDIO_SESSION_INVALID_STATE", "Invalid state");
      s.status = "rejected";
    } else if (status === "active") {
      if (!owner && !listener) throw new AuthorizationError();
      if (s.status !== "connecting")
        throw new AppError(409, "AUDIO_SESSION_INVALID_STATE", "Invalid state");
      s.status = "active";
      s.startedAt = new Date();
    } else throw new AppError(422, "VALIDATION_ERROR", "Unsupported status");
    await s.save();
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
    return s;
  },
};
