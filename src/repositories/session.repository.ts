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
  /** Drop unfinished sessions so a new listen request is not blocked as BUSY. */
  clearPendingFor: async (id: string) => {
    const staleBefore = new Date(Date.now() - 2 * 60 * 1000);
    await AudioSession.updateMany(
      {
        status: { $in: ["requesting", "connecting", "stopping", "active"] },
        $or: [{ ownerUserId: id }, { listenerUserId: id }],
        updatedAt: { $lt: staleBefore },
      },
      {
        $set: {
          status: "stopped",
          endedAt: new Date(),
        },
      },
    );
    await AudioSession.updateMany(
      {
        status: { $in: ["requesting", "connecting", "stopping"] },
        $or: [{ ownerUserId: id }, { listenerUserId: id }],
      },
      {
        $set: {
          status: "stopped",
          endedAt: new Date(),
        },
      },
    );
  },
  updateState: (id: string, from: string[], to: string, extra: any = {}) =>
    AudioSession.findOneAndUpdate(
      { _id: id, status: { $in: from } },
      { $set: { status: to, ...extra } },
      { new: true },
    ),
};
