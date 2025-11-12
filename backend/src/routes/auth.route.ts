import express from "express"
import { loginHandler, logoutHandler, singUpHandler } from "../controller/auth.controller.js";

const router = express.Router();

router.route("/login").get(loginHandler);
router.route("/signup").get(singUpHandler);
router.route("/logout").get(logoutHandler);

export default router 