import { Router } from "express";
import { auth } from "../middleware/auth.middleware";
import { audioPermissionController as p } from "../controllers/audioPermission.controller";
import { audioSessionController as s } from "../controllers/audioSession.controller";
import { validate } from "../middleware/validation.middleware";
import {
  permissionSchema,
  createSessionSchema,
  patchSessionSchema,
  stopSchema,
} from "../validators/audio.validator";
import { actionLimiter } from "../middleware/rateLimit.middleware";
import { env } from "../config/env";

const r = Router();
r.use(auth);
r.get("/permissions", p.list);
r.put("/permissions", validate(permissionSchema), p.set);
r.post("/sessions", actionLimiter, validate(createSessionSchema), s.create);
r.get("/sessions/active", s.active);
r.patch("/sessions/:id", validate(patchSessionSchema), s.patch);
r.post("/sessions/:id/stop", validate(stopSchema), s.stop);

type IceServer = Record<string, unknown>;

let meteredCache: { at: number; servers: IceServer[] } | null = null;
const METERED_CACHE_MS = 60_000;

function staticIceServers(): IceServer[] {
  const servers: IceServer[] = [
    { urls: env.STUN_URL || "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ];

  if (env.TURN_URL && env.TURN_USERNAME && env.TURN_PASSWORD) {
    const urls = env.TURN_URL.split(",")
      .map((u) => u.trim())
      .filter(Boolean);
    for (const url of urls) {
      servers.push({
        urls: url,
        username: env.TURN_USERNAME,
        credential: env.TURN_PASSWORD,
      });
    }
  }
  return servers;
}

async function meteredIceServers(): Promise<IceServer[] | null> {
  const domain = env.METERED_DOMAIN?.trim();
  const apiKey = env.METERED_TURN_API_KEY?.trim();
  if (!domain || !apiKey) return null;

  if (meteredCache && Date.now() - meteredCache.at < METERED_CACHE_MS) {
    return meteredCache.servers;
  }

  const host = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const url = `https://${host}/api/v1/turn/credentials?apiKey=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Metered TURN fetch failed: ${res.status}`);
  }
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Metered TURN returned empty iceServers");
  }
  const servers = data as IceServer[];
  meteredCache = { at: Date.now(), servers };
  return servers;
}

async function iceServers(): Promise<IceServer[]> {
  try {
    const metered = await meteredIceServers();
    if (metered?.length) return metered;
  } catch (error) {
    console.error("[ice-servers] Metered fetch failed, using static list:", error);
  }
  return staticIceServers();
}

r.get("/ice-servers", async (_req, res) => {
  try {
    const servers = await iceServers();
    res.json({
      success: true,
      data: { iceServers: servers },
    });
  } catch (error) {
    console.error("[ice-servers]", error);
    res.json({
      success: true,
      data: { iceServers: staticIceServers() },
    });
  }
});

export default r;
