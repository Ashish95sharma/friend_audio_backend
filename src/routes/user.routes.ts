import { Router } from "express";
import { auth } from "../middleware/auth.middleware";
import { userController } from "../controllers/user.controller";
const r = Router();
r.use(auth);
r.get("/me", userController.me);
r.get("/search", userController.search);
export default r;
