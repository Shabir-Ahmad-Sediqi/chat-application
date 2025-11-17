import { Request, Response } from "express";
import Message from "../models/message.js";
import User from "../models/User.js";
import imagekit from "../lib/imageKit.js";

interface ApiResponse<T>{
    success: boolean;
    data?: T;
    message?: string
};

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

        const filteredUsers = await User.find({_id: { $ne: loggedInUserId}}).select("-password")
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
        });

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
        const file = req.file;

        let imageUrl: string | undefined;
        if (file){
            // upload image to imageKit
            const uploaded = await imagekit.upload({
                file: file.buffer.toString("base64"),
                fileName: `img-${Date.now()}`
            });
            imageUrl = uploaded.url;
        }

        // create and save message
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        await newMessage.save()

        // todo: later will implement socket.io to send real time messsages

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
        console.log("ID LOggedin user")
        console.log(loggedInUserId)

        const messages = await Message.find({
            $or: [
                {senderId: loggedInUserId} ,
                {receiverId: loggedInUserId},
            ],
        });
      
        console.log(messages)

        const chatPartnersIds = [
        ...new Set(messages.map((msg) => 
            msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()  
            : msg.senderId.toString() 
        ))
        ];
        console.log(chatPartnersIds)
        const chatPartners = await User.find({_id: {$in:chatPartnersIds}}).select("-password")
        console.log(chatPartners)
        res.status(200).json({success: true, data: chatPartners})
    }catch(error){
        console.log(`Error in getpartners chat ${error}`)
        return res.status(500).json({success: false, message: "Internal server error"})
    }
}