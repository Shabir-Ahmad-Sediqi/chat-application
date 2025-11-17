import express from "express"
import { loginHandler, logoutHandler, signUpHandler, updateProfile, isAuthenticated } from "../controller/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";


const router = express.Router();

router.use(arcjetProtection)

router.route("/login").post(loginHandler);
router.route("/signup").post(signUpHandler);
router.route("/logout").post(protectRoute, logoutHandler);
router.route("/update-profile").put(protectRoute,upload.single("profilePic"), updateProfile)

// check if user is authenticated

router.route("/check").get(protectRoute, isAuthenticated)

export default router 