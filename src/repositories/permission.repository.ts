import { AudioPermission } from "../models/AudioPermission";
export const permissions = {
  get: (o: string, l: string) =>
    AudioPermission.findOne({ ownerUserId: o, listenerUserId: l }),
  upsert: (o: string, l: string, isAllowed: boolean) =>
    AudioPermission.findOneAndUpdate(
      { ownerUserId: o, listenerUserId: l },
      { $set: { isAllowed } },
      { new: true, upsert: true },
    ),
  forOwner: (o: string) =>
    AudioPermission.find({ ownerUserId: o }).populate(
      "listenerUserId",
      "username displayName isOnline avatarUrl",
    ),
};
