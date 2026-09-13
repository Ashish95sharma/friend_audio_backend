import { Request, Response } from "express";
import { userService } from "../services/user.service";
import { ok } from "../utils/response";
export const userController = {
  me: async (r: Request, s: Response) =>
    ok(s, await userService.me(r.auth!.userId)),
  search: async (r: Request, s: Response) =>
    ok(
      s,
      await userService.search(
        r.auth!.userId,
        String(r.query.q || ""),
        Number(r.query.page || 1),
        Math.min(Number(r.query.limit || 20), 50),
      ),
    ),
};
