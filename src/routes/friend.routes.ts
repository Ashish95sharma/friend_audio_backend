import { Router } from "express";
import { auth } from "../middleware/auth.middleware";
import { friendController as c } from "../controllers/friend.controller";
import { validate } from "../middleware/validation.middleware";
import {
  requestSchema,
  idSchema,
  userIdSchema,
  requestsQuerySchema,
} from "../validators/friend.validator";
import { actionLimiter } from "../middleware/rateLimit.middleware";
const r = Router();
r.use(auth);
r.get("/", c.list);
r.get("/requests", validate(requestsQuerySchema), c.requests);
r.post("/requests", actionLimiter, validate(requestSchema), c.send);
r.post("/requests/:id/accept", validate(idSchema), c.accept);
r.post("/requests/:id/reject", validate(idSchema), c.reject);
r.delete("/:userId", validate(userIdSchema), c.remove);
export default r;
