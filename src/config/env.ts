import "dotenv/config";
import { z } from "zod";
const s = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_SECRET: z.string().min(16),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("30d"),
  CLIENT_ORIGIN: z.string().default("*"),
  WS_PATH: z.string().default("/ws"),
  API_PREFIX: z.string().default(""),
  STUN_URL: z.string().default("stun:stun.l.google.com:19302"),
  TURN_URL: z.string().optional(),
  TURN_USERNAME: z.string().optional(),
  TURN_PASSWORD: z.string().optional(),
  REQUESTING_TIMEOUT_MS: z.coerce.number().default(60000),
  CONNECTING_TIMEOUT_MS: z.coerce.number().default(120000),
  HEARTBEAT_INTERVAL_MS: z.coerce.number().default(30000),
});
export const env = s.parse(process.env);
