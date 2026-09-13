import { Friendship, pair } from "../models/Friendship";
import { FriendRequest } from "../models/FriendRequest";
export const friends = {
  exists: async (a: string, b: string) => {
    const [userA, userB] = pair(a, b);
    return !!(await Friendship.exists({ userA, userB }));
  },
  create: async (a: string, b: string) => {
    const [userA, userB] = pair(a, b);
    return Friendship.create({ userA, userB });
  },
  list: (id: string) =>
    Friendship.find({ $or: [{ userA: id }, { userB: id }] }),
  remove: async (a: string, b: string) => {
    const [userA, userB] = pair(a, b);
    return Friendship.findOneAndDelete({ userA, userB });
  },
  pendingBetween: (a: string, b: string) =>
    FriendRequest.findOne({
      status: "pending",
      $or: [
        { fromUserId: a, toUserId: b },
        { fromUserId: b, toUserId: a },
      ],
    }),
  request: (a: string, b: string) =>
    FriendRequest.create({ fromUserId: a, toUserId: b }),
  requestsFor: (id: string) =>
    FriendRequest.find({ toUserId: id, status: "pending" }).populate(
      "fromUserId",
      "username displayName avatarUrl isOnline",
    ),
  sentRequestsFor: (id: string) =>
    FriendRequest.find({ fromUserId: id, status: "pending" }),
  findRequest: (id: string) => FriendRequest.findById(id),
};
