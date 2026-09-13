import { users } from "../repositories/user.repository";
import { friends } from "../repositories/friend.repository";
import { NotFoundError } from "../utils/errors";
import { authService } from "./auth.service";
export const userService = {
  me: async (id: string) => {
    const u = await users.findById(id);
    if (!u) throw new NotFoundError("USER_NOT_FOUND", "User not found");
    return authService.dto(u);
  },
  search: async (id: string, q: string, page = 1, limit = 20) => {
    const fs = await friends.list(id);
    const ids = fs.map((f: any) =>
      String(f.userA) === id ? String(f.userB) : String(f.userA),
    );
    return users
      .search(q, id, ids, (page - 1) * limit, limit)
      .then((x: any[]) => x.map(authService.dto));
  },
};
