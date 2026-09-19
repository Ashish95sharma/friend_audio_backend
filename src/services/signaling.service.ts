import { audioSessionService } from "./audioSession.service";
import { sessions } from "../repositories/session.repository";
import { AuthorizationError } from "../utils/errors";

export const signalingService = {
  verify: async (user: string, sessionId: string, type: string) => {
    const s: any = await sessions.find(sessionId);
    if (!s) throw new AuthorizationError("Unknown session");
    const owner = String(s.ownerUserId) === user;
    const listener = String(s.listenerUserId) === user;
    if (
      (!owner && !listener) ||
      ["stopped", "rejected", "permissionRevoked"].includes(s.status)
    ) {
      throw new AuthorizationError();
    }
    // Owner sends the offer (has the mic); listener answers.
    if (type === "audio.offer" && !owner) throw new AuthorizationError();
    if (type === "audio.answer" && !listener) throw new AuthorizationError();
    if (type === "audio.listener.ready" && !listener)
      throw new AuthorizationError();
    return s;
  },
};
