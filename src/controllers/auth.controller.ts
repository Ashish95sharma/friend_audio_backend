import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { ok } from "../utils/response";
export const authController = {
  register: async (r: Request, s: Response) =>
    ok(s, await authService.register((r as any).validated.body), 201),
  login: async (r: Request, s: Response) =>
    ok(s, await authService.login((r as any).validated.body)),
  logout: async (r: Request, s: Response) => ok(s, {}),
};
