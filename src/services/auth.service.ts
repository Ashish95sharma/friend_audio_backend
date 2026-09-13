import { users } from "../repositories/user.repository";
import { hashPassword, verifyPassword } from "../utils/password";
import { ConflictError, AuthenticationError } from "../utils/errors";
import { signAccessToken, randomToken, hashToken } from "../utils/jwt";
import { RefreshToken } from "../models/RefreshToken";
import crypto from "crypto";
const dto = (u: any) => ({
  id: String(u._id),
  username: u.username,
  displayName: u.displayName,
  email: u.email,
  avatarUrl: u.avatarUrl ?? null,
  isOnline: u.isOnline,
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
    const sid = crypto.randomUUID();
    const token = signAccessToken({ userId: String(u._id), sid });
    return { token, user: dto(u) };
  },
  login: async (x: any) => {
    const u = await users.findByLogin(x.emailOrUsername);
    if (!u || !(await verifyPassword(x.password, u.passwordHash)))
      throw new AuthenticationError("Invalid credentials");
    const sid = crypto.randomUUID();
    return {
      token: signAccessToken({ userId: String(u._id), sid }),
      user: dto(u),
    };
  },
  logout: async () => ({}),
};
