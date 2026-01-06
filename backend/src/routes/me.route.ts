import express from "express";
import { getBlockedUsersDetailed } from "../controller/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/blocked").get(protectRoute, getBlockedUsersDetailed);

export default router;
