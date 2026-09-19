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
const r = Router();
r.use(auth);
r.get("/permissions", p.list);
r.put("/permissions", validate(permissionSchema), p.set);
r.post("/sessions", actionLimiter, validate(createSessionSchema), s.create);
r.get("/sessions/active", s.active);
r.patch("/sessions/:id", validate(patchSessionSchema), s.patch);
r.post("/sessions/:id/stop", validate(stopSchema), s.stop);
r.get("/ice-servers", (req, res) =>
  res.json({
    success: true,
    data: {
      iceServers: [
        { urls: process.env.STUN_URL || "stun:stun.l.google.com:19302" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443?transport=tcp",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    },
  }),
);
export default r;
