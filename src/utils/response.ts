import { Response } from "express";
export const ok = (r: Response, data: any, status = 200) =>
  r.status(status).json({ success: true, data });
