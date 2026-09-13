import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middleware/validation.middleware";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import { auth } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/rateLimit.middleware";
const r = Router();
r.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  authController.register,
);
r.post("/login", authLimiter, validate(loginSchema), authController.login);
r.post("/logout", auth, authController.logout);
export default r;
