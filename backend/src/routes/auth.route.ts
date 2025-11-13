import express from "express"
import { loginHandler, logoutHandler, signUpHandler } from "../controller/auth.controller.js";

const router = express.Router();

router.route("/login").get(loginHandler);
router.route("/signup").post(signUpHandler);
router.route("/logout").get(logoutHandler);

export default router 