import express from "express"
import { loginHandler, logoutHandler, signUpHandler } from "../controller/auth.controller.js";

const router = express.Router();

router.route("/login").post(loginHandler);
router.route("/signup").post(signUpHandler);
router.route("/logout").post(logoutHandler);

export default router 