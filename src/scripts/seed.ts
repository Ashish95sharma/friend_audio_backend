import { connectDatabase } from "../config/database";
import { User } from "../models/User";
import { Friendship } from "../models/Friendship";
import { AudioPermission } from "../models/AudioPermission";
import { FriendRequest } from "../models/FriendRequest";
import { hashPassword } from "../utils/password";
async function run() {
  await connectDatabase();
  await Promise.all([
    User.deleteMany({}),
    Friendship.deleteMany({}),
    AudioPermission.deleteMany({}),
    FriendRequest.deleteMany({}),
  ]);
  const pass = await hashPassword("password123");
  const xs: any[] = [];
  for (const name of ["Sarah", "Ashish", "John", "Emma"])
    xs.push(
      await User.create({
        username: name.toLowerCase(),
        email: `${name.toLowerCase()}@example.com`,
        displayName: name,
        passwordHash: pass,
        isOnline: name === "Sarah",
      }),
    );
  await Friendship.create({ userA: xs[0]._id, userB: xs[1]._id });
  await Friendship.create({ userA: xs[0]._id, userB: xs[2]._id });
  await AudioPermission.create({
    ownerUserId: xs[0]._id,
    listenerUserId: xs[1]._id,
    isAllowed: true,
  });
  await AudioPermission.create({
    ownerUserId: xs[2]._id,
    listenerUserId: xs[0]._id,
    isAllowed: false,
  });
  await FriendRequest.create({
    fromUserId: xs[3]._id,
    toUserId: xs[1]._id,
    status: "pending",
  });
  console.log("Seed complete. password=password123");
  process.exit(0);
}
run();
