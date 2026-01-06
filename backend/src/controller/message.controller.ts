import { Request, Response } from "express";
import Message from "../models/message.js";
import HiddenChat from "../models/HiddenChat.js";
import UserBlock from "../models/UserBlock.js";
import User from "../models/User.js";
import imagekit from "../lib/imageKit.js";
import { getReceiverSocketId, io } from "../lib/socket.io.js";

interface AuthRequest extends Request {
    user?: { _id: string };
    file?: Express.Multer.File; // <- TypeScript knows file exists
}

export const getAllContacts = async (req: AuthRequest, res: Response) => {
    try{
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const loggedInUserId = req.user._id;

        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId }, deletedAt: null })
            .select("fullName profilePic username bio")
        res.status(200).json({success: true, data: filteredUsers})
    }catch(error){
        console.log(`Error in getAllContacts ${error}`);
        res.status(500).json({success: false, message: "Server Error"})
    }
};

export const getMessagesById = async (req: AuthRequest, res: Response) => {
    try{
        const myId = req.user?._id
        const { id: userToChatId } = req.params;

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: userToChatId},
                {senderId: userToChatId, receiverId: myId}
            ],
        }).sort({createdAt: 1});

        res.status(200).json({success: true, data: messages})
    }catch(error){
        console.log(`Error in getMessage controller ${error}`);
        res.status(500).json({success: false, message: "Internal server error"})
    }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
    try{
        const {text} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user?._id;
        const files = (req.files as Express.Multer.File[]) || [];

        if (!senderId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const normalizedText = typeof text === "string" ? text.trim() : "";
        if (!normalizedText && files.length === 0) {
            return res.status(400).json({ message: "Text or attachment is required." });
        }
        if (senderId === receiverId) {
            return res.status(400).json({ message: "Cannot send messages to yourself." });
            }
        const receiverExists = await User.exists({ _id: receiverId, deletedAt: null });
        if (!receiverExists) {
            return res.status(410).json({
                success: false,
                error: { code: "RECIPIENT_DELETED", message: "This user no longer exists." }
            });
        }

        const hasBlock = await UserBlock.exists({
            $or: [
                { blockerId: senderId, blockedId: receiverId },
                { blockerId: receiverId, blockedId: senderId }
            ]
        });
        if (hasBlock) {
            return res.status(403).json({
                success: false,
                error: { code: "USER_BLOCKED", message: "You cannot message this user." }
            });
        }

        const attachments = [];
        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                return res.status(400).json({ message: "File exceeds 5MB limit." });
            }
            const uploaded = await imagekit.upload({
                file: file.buffer,
                fileName: file.originalname
            });
            attachments.push({
                type: file.mimetype.startsWith("image/") ? "image" : "file",
                url: uploaded.url,
                fileName: file.originalname,
                fileSize: file.size,
                mimeType: file.mimetype
            });
        }

        const firstImage = attachments.find((attachment: any) => attachment.type === "image");

        // create and save message
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text: normalizedText || undefined,
            image: firstImage?.url,
            attachments
        });

        await newMessage.save()

        await HiddenChat.deleteOne({ ownerId: receiverId, otherUserId: senderId });

        // todo: later will implement socket.io to send real time messsages
        const receiverSocketiD = getReceiverSocketId(receiverId)
        if (receiverSocketiD){
            io.to(receiverSocketiD).emit("newMessage", newMessage)
        }

        res.status(201).json({ success: true, data: newMessage });
    }catch(error){
        console.log(`Error in sendMessage controller ${error}`);
        res.status(500).json({ success: false, message: `Internal server error ${error}` });
    }
};

export const getChatPartners = async (req: AuthRequest, res: Response) => {
    try{

        const loggedInUserId = req.user?._id;
        if (!loggedInUserId){
            return res.status(400).json({success: false, message: "You are possibly not logged in"})
        }

        const messages = await Message.find({
            $or: [
                {senderId: loggedInUserId} ,
                {receiverId: loggedInUserId},
            ],
        });

        const chatPartnersIds = [
        ...new Set(messages.map((msg) => 
            msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()  
            : msg.senderId.toString() 
        ))
        ];

        const hiddenChats = await HiddenChat.find({ ownerId: loggedInUserId }).select("otherUserId");
        const hiddenIds = hiddenChats.map((entry) => entry.otherUserId.toString());

        const chatPartners = await User.find({
            _id: { $in: chatPartnersIds, $nin: hiddenIds },
            deletedAt: null
        })
            .select("fullName profilePic username bio")

        res.status(200).json({success: true, data: chatPartners})
    }catch(error){
        console.log(`Error in getpartners chat ${error}`)
        return res.status(500).json({success: false, message: "Internal server error"})
    }
}

export const hideChat = async (req: AuthRequest, res: Response) => {
    try {
        const ownerId = req.user?._id;
        const { id: otherUserId } = req.params;
        if (!ownerId) return res.status(401).json({ success: false, message: "Unauthorized" });

        await HiddenChat.updateOne(
            { ownerId, otherUserId },
            { $set: { hiddenAt: new Date() } },
            { upsert: true }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.log(`Error in hideChat controller ${error}`);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
