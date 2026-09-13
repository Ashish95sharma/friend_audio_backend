import { Schema, model, Types } from "mongoose";
const schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    displayName: { type: String, required: true },
    avatarUrl: { type: String, default: null },
    isOnline: { type: Boolean, default: false },
    lastSeenAt: { type: Date, default: null },
  },
  { timestamps: true },
);
export type UserDoc = {
  _id: Types.ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  avatarUrl?: string | null;
  isOnline: boolean;
  lastSeenAt?: Date;
};
export const User = model("User", schema);
