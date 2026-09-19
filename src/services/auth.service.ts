import { users } from "../repositories/user.repository";
import { hashPassword, verifyPassword } from "../utils/password";
import { ConflictError, AuthenticationError } from "../utils/errors";
import { signAccessToken } from "../utils/jwt";
import crypto from "crypto";
import { presenceService } from "./presence.service";

const dto = (u: any) => ({
  id: String(u._id),
  username: u.username,
  displayName: u.displayName,
  email: u.email,
  avatarUrl: u.avatarUrl ?? null,
  isOnline: !!u.isOnline,
  lastSeenAt: u.lastSeenAt ?? null,
});

export const authService = {
  dto,
  register: async (x: any) => {
    if (
      (await users.findByLogin(x.email)) ||
      (await users.findByLogin(x.username))
    )
      throw new ConflictError(
        "AUTH_USER_EXISTS",
        "Username or email already exists",
      );
    const u = await users.create({
      ...x,
      passwordHash: await hashPassword(x.password),
      displayName: x.displayName || x.username,
    });
    const id = String(u._id);
    await presenceService.online(id);
    const fresh: any = await users.findById(id);
    const sid = crypto.randomUUID();
    const token = signAccessToken({ userId: id, sid });
    return { token, user: dto(fresh ?? u) };
  },
  login: async (x: any) => {
    const u = await users.findByLogin(x.emailOrUsername);
    if (!u || !(await verifyPassword(x.password, u.passwordHash)))
      throw new AuthenticationError("Invalid credentials");
    const id = String(u._id);
    await presenceService.online(id);
    const fresh: any = await users.findById(id);
    const sid = crypto.randomUUID();
    return {
      token: signAccessToken({ userId: id, sid }),
      user: dto(fresh ?? { ...u.toObject?.() ?? u, isOnline: true }),
    };
  },
  logout: async (userId?: string) => {
    if (userId) await presenceService.offline(userId);
    return {};
  },
};
