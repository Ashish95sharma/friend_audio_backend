import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env";
export type TokenPayload = { userId: string; sid: string };
export const signAccessToken = (p: TokenPayload) =>
  jwt.sign(p, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
export const verifyAccessToken = (t: string) =>
  jwt.verify(t, env.JWT_SECRET) as TokenPayload;
export const randomToken = () => crypto.randomBytes(48).toString("hex");
export const hashToken = (t: string) =>
  crypto.createHash("sha256").update(t).digest("hex");
