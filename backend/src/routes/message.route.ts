
import express from "express";
import { sendMessageController } from "../controller/message.controller.js";

const router = express.Router();

router.route('/send').get(sendMessageController)

export default router 
