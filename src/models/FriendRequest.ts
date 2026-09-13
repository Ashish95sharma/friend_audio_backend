import { Schema, model } from "mongoose";
const s = new Schema(
  {
    fromUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);
s.index({ fromUserId: 1, toUserId: 1, status: 1 });
export const FriendRequest = model("FriendRequest", s);
