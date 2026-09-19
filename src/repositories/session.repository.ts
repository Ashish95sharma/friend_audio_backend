import { AudioSession, ACTIVE } from "../models/AudioSession";

/** Only live media counts as busy — pending "requesting" must not block accept. */
const BUSY = ["connecting", "active"];

export const sessions = {
  create: (x: any) => AudioSession.create(x),
  find: (id: string) => AudioSession.findById(id),
  activeFor: async (id: string, excludeSessionId?: string) =>
    AudioSession.findOne({
      status: { $in: ACTIVE },
      $or: [{ ownerUserId: id }, { listenerUserId: id }],
      ...(excludeSessionId ? { _id: { $ne: excludeSessionId } } : {}),
    }),
  busyFor: async (id: string, excludeSessionId?: string) =>
    AudioSession.findOne({
      status: { $in: BUSY },
      $or: [{ ownerUserId: id }, { listenerUserId: id }],
      ...(excludeSessionId ? { _id: { $ne: excludeSessionId } } : {}),
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
  /** Drop unfinished sessions so a new listen request is not blocked. */
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
  /** Stop any open session between this pair so they can re-pair cleanly. */
  clearBetween: async (a: string, b: string) => {
    await AudioSession.updateMany(
      {
        status: { $in: ACTIVE },
        $or: [
          { ownerUserId: a, listenerUserId: b },
          { ownerUserId: b, listenerUserId: a },
        ],
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
