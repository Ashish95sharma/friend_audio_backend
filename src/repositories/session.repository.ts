import { AudioSession, ACTIVE } from "../models/AudioSession";
export const sessions = {
  create: (x: any) => AudioSession.create(x),
  find: (id: string) => AudioSession.findById(id),
  activeFor: async (id: string) =>
    AudioSession.findOne({
      status: { $in: ACTIVE },
      $or: [{ ownerUserId: id }, { listenerUserId: id }],
    }),
  activeBetween: (a: string, b: string) =>
    AudioSession.findOne({
      status: { $in: ACTIVE },
      ownerUserId: a,
      listenerUserId: b,
    }),
  activeInvolving: (a: string, b: string) =>
    AudioSession.find({
      status: { $in: ACTIVE },
      $or: [
        { ownerUserId: a, listenerUserId: b },
        { ownerUserId: b, listenerUserId: a },
      ],
    }),
  updateState: (id: string, from: string[], to: string, extra: any = {}) =>
    AudioSession.findOneAndUpdate(
      { _id: id, status: { $in: from } },
      { $set: { status: to, ...extra } },
      { new: true },
    ),
};
