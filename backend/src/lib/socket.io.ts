
import {Server} from "socket.io";
import http from "http";
import express from "express";
import "dotenv/config";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import { Socket } from "socket.io";
import { AuthenticatedSocket } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
    }
});

io.use(socketAuthMiddleware)

// this is for checking if a user is online
export const getReceiverSocketId = (userId: string) => {
    return userSocketMap[userId]
}

// this is for storing online users

const userSocketMap: Record<string, string> = {}; // {userid: socketid}

io.on("connection", (s: Socket) => {
    const socket = s as AuthenticatedSocket

    console.log("A User Connected", socket.user?.fullName)

    const userId = socket.userId!
    userSocketMap[userId] = socket.id

    // io.emit() is used to send events to all connected users
    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    socket.on("disconnect", () => {
        console.log("A User Disconnected", socket?.user?.fullName)
        delete userSocketMap[userId]
        socket.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
});

export {io, app, server}