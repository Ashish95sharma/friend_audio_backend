import { Schema, model } from "mongoose";
const s = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true },
    revokedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);
s.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const RefreshToken = model("RefreshToken", s);
