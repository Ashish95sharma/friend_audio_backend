import { audioSessionService } from "./audioSession.service";
import { sessions } from "../repositories/session.repository";
import { AuthorizationError } from "../utils/errors";
export const signalingService = {
  verify: async (user: string, sessionId: string, type: string) => {
    const s: any = await sessions.find(sessionId);
    if (!s) throw new AuthorizationError("Unknown session");
    const owner = String(s.ownerUserId) === user,
      listener = String(s.listenerUserId) === user;
    if (
      (!owner && !listener) ||
      ["stopped", "rejected", "permissionRevoked"].includes(s.status)
    )
      throw new AuthorizationError();
    if (type === "audio.offer" && !listener) throw new AuthorizationError();
    if (type === "audio.answer" && !owner) throw new AuthorizationError();
    return s;
  },
};
