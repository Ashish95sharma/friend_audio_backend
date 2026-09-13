import { Schema, model, Types } from "mongoose";
const s = new Schema(
  {
    userA: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userB: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);
s.index({ userA: 1, userB: 1 }, { unique: true });
export const Friendship = model("Friendship", s);
export const pair = (a: string, b: string) => [a, b].sort();
