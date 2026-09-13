import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import friendRoutes from "./routes/friend.routes";
import audioRoutes from "./routes/audio.routes";
import { dbState } from "./config/database";
const app = express();
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN === "*" ? true : env.CLIENT_ORIGIN }));
app.use(express.json({ limit: "100kb" }));
app.use(pinoHttp());
const p = env.API_PREFIX;
app.get("/health", (r, s) =>
  s.json({ success: true, data: { status: "ok", database: dbState() } }),
);
app.use(p + "/auth", authRoutes);
app.use(p + "/users", userRoutes);
app.use(p + "/friends", friendRoutes);
app.use(p + "/audio", audioRoutes);
app.use(errorHandler);
export default app;
