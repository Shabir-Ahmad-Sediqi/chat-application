import express from "express"
import { loginHandler, logoutHandler, signUpHandler, updateProfile, isAuthenticated, deleteAccount, updateProfileDetails, removeProfileImage, changePassword } from "../controller/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { uploadProfileImage } from "../middleware/multer.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";


const router = express.Router();

// router.use(arcjetProtection)

router.route("/login").post(loginHandler);
router.route("/signup").post(signUpHandler);
router.route("/logout").post(protectRoute, logoutHandler);
router.route("/update-profile").put(protectRoute,uploadProfileImage.single("profilePic"), updateProfile)
router.route("/profile-image").delete(protectRoute, removeProfileImage)
router.route("/delete-account").post(protectRoute, deleteAccount)
router.route("/me").patch(protectRoute, updateProfileDetails)
router.route("/change-password").post(arcjetProtection, protectRoute, changePassword)

// check if user is authenticated

router.route("/check").get(protectRoute, isAuthenticated)

export default router 
