import express from "express";
import { blockUser, getBlockedUsers, getBlockedUsersDetailed, getPublicProfile, unblockUser } from "../controller/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/blocked/list").get(protectRoute, getBlockedUsers);
router.route("/blocked/detail").get(protectRoute, getBlockedUsersDetailed);
router.route("/:id/block").post(protectRoute, blockUser);
router.route("/:id/block").delete(protectRoute, unblockUser);
router.route("/:id").get(protectRoute, getPublicProfile);

export default router;
