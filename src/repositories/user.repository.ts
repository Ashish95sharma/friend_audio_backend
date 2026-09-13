import { User } from "../models/User";
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const users = {
  findById: (id: string) => User.findById(id),
  findByLogin: (v: string) =>
    User.findOne({
      $or: [
        { email: v.toLowerCase() },
        { username: new RegExp("^" + escapeRegex(v) + "$", "i") },
      ],
    }).select("+passwordHash"),
  create: (x: any) => User.create(x),
  search: (
    q: string,
    exclude: string,
    ids: string[],
    skip: number,
    limit: number,
  ) =>
    User.find(
      {
        _id: { $ne: exclude, $nin: ids },
        $or: [
          { username: new RegExp(q, "i") },
          { displayName: new RegExp(q, "i") },
        ],
      },
      { passwordHash: 0 },
    )
      .skip(skip)
      .limit(limit),
};
