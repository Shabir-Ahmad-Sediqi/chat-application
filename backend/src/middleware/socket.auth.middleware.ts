
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import "dotenv/config"
import { NextFunction } from "express"
import { Socket } from "socket.io"
import { PublicUserResponse } from "../controller/auth.controller.js"

export interface AuthenticatedSocket extends Socket{
    user?: PublicUserResponse;
    userId?: string;
}

export const socketAuthMiddleware = async (s: Socket,  next: (err?: Error) => void) => {

    try{
        const socket = s as AuthenticatedSocket
        // extract token from http-only cookies
        const token = socket.handshake.headers.cookie
         ?.split("; ")
         .find((row: any) => row.startsWith("jwt="))
         ?.split("=")[1]

        if (!token){
            console.log("Socket connection rejected, no token provided")
            return next(new Error("Unauthorized - No Token Provided"))
        };

        // verify the token

        const decode = jwt.verify(token, process.env.JWT_SECRET!)

        if (!decode){
            console.log("Socket connection rejected - invalid token")
            return next(new Error("Unauthorized - No Token"))
        };

        if (typeof decode === "string") {
            console.log("Socket connection rejected - token payload is raw string");
            return next(new Error("Unauthorized - Invalid Token Payload"));
         }

        const user = await User.findById(decode.userId).select("-password");
        if (!user){
            console.log("Socket Connection Rejected - User Not Found");
            return next(new Error("User Not Found"))
        }

        socket.user = {
            _id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        }
        socket.userId = user._id.toString()

        console.log("Socket Authenticated for this user", user.fullName)

        next()
    }catch(error: any){
        console.log("Error in Socket authentication", error.message);
        next(new Error("Unauthorized - Authentication failed"))
    }

}