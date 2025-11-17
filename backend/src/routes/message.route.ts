
import express from "express";
import { getAllContacts, getChatPartners, getMessagesById, sendMessage } from "../controller/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.route('/getcontacts').get(getAllContacts);
router.route("/chats").get(getChatPartners);
router.route("/:id").get(getMessagesById);
router.route("/send/:id").post(sendMessage);

export default router 
