
import express from "express";
import { getAllContacts, getChatPartners, getMessagesById, sendMessage, hideChat } from "../controller/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";
import { uploadMessageAttachments } from "../middleware/multer.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.route('/getcontacts').get(getAllContacts);
router.route("/chats").get(getChatPartners);
router.route("/:id").get(getMessagesById);
router.route("/send/:id").post(uploadMessageAttachments.array("attachments", 5),sendMessage);
router.route("/hide/:id").post(hideChat);

export default router 
