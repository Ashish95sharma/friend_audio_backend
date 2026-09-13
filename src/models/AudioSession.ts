import { Schema, model } from "mongoose";
export const ACTIVE = ["requesting", "connecting", "active", "stopping"];
const s = new Schema(
  {
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    listenerUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "idle",
        "requesting",
        "connecting",
        "active",
        "stopping",
        "stopped",
        "rejected",
        "failed",
        "permissionRevoked",
      ],
      required: true,
    },
    startedAt: Date,
    endedAt: Date,
    endedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);
s.index({ ownerUserId: 1, status: 1 });
s.index({ listenerUserId: 1, status: 1 });
export const AudioSession = model("AudioSession", s);
