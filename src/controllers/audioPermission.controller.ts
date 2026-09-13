import { Request, Response } from "express";
import { audioPermissionService } from "../services/audioPermission.service";
import { ok } from "../utils/response";
export const audioPermissionController = {
  list: async (r: Request, s: Response) =>
    ok(s, await audioPermissionService.list(r.auth!.userId)),
  set: async (r: Request, s: Response) =>
    ok(
      s,
      await audioPermissionService.set(
        r.auth!.userId,
        (r as any).validated.body,
      ),
    ),
};
