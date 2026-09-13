import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { AuthenticationError } from "../utils/errors";
declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; sid: string };
    }
  }
}
export function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const h = req.headers.authorization;
    if (!h?.startsWith("Bearer ")) throw new Error();
    req.auth = verifyAccessToken(h.slice(7));
    next();
  } catch {
    next(new AuthenticationError());
  }
}
