import { Schema, model } from "mongoose";
const s = new Schema(
  {
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    listenerUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isAllowed: { type: Boolean, required: true },
  },
  { timestamps: true },
);
s.index({ ownerUserId: 1, listenerUserId: 1 }, { unique: true });
export const AudioPermission = model("AudioPermission", s);
