import { Request, Response } from "express";
import { audioSessionService } from "../services/audioSession.service";
import { ok } from "../utils/response";
export const audioSessionController = {
  create: async (r: Request, s: Response) =>
    ok(
      s,
      await audioSessionService.create(
        r.auth!.userId,
        (r as any).validated.body,
      ),
      201,
    ),
  active: async (r: Request, s: Response) =>
    ok(s, await audioSessionService.active(r.auth!.userId)),
  patch: async (r: Request, s: Response) =>
    ok(
      s,
      await audioSessionService.transition(
        r.auth!.userId,
        String(r.params.id),
        (r as any).validated.body.status,
      ),
    ),
  stop: async (r: Request, s: Response) =>
    ok(s, await audioSessionService.stop(r.auth!.userId, String(r.params.id))),
};
