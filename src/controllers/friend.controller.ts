import { Request, Response } from "express";
import { friendService } from "../services/friend.service";
import { ok } from "../utils/response";
export const friendController = {
  list: async (r: Request, s: Response) =>
    ok(s, await friendService.list(r.auth!.userId)),
  requests: async (r: Request, s: Response) =>
    ok(
      s,
      await friendService.requests(
        r.auth!.userId,
        (r as any).validated.query.direction || "incoming",
      ),
    ),
  send: async (r: Request, s: Response) =>
    ok(
      s,
      await friendService.send(
        r.auth!.userId,
        (r as any).validated.body.userId,
      ),
      201,
    ),
  accept: async (r: Request, s: Response) =>
    ok(s, await friendService.accept(r.auth!.userId, String(r.params.id))),
  reject: async (r: Request, s: Response) =>
    ok(s, await friendService.reject(r.auth!.userId, String(r.params.id))),
  remove: async (r: Request, s: Response) =>
    ok(s, await friendService.remove(r.auth!.userId, String(r.params.userId))),
};
