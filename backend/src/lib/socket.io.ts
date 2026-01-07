
import {Server} from "socket.io";
import http from "http";
import express from "express";
import "dotenv/config";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import { Socket } from "socket.io";
import { AuthenticatedSocket } from "../middleware/socket.auth.middleware.js";

const allowedOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: allowedOrigins.length ? allowedOrigins : true,
        credentials: true
    }
});

io.use(socketAuthMiddleware)

// this is for checking if a user is online
export const getReceiverSocketId = (userId: string) => {
    const sockets = userSocketMap[userId];
    if (!sockets || sockets.size === 0) return undefined;
    return Array.from(sockets)[0];
}

export const getReceiverSocketIds = (userId: string) => {
    const sockets = userSocketMap[userId];
    if (!sockets || sockets.size === 0) return [];
    return Array.from(sockets);
}

export const removeUserPresence = (userId: string) => {
    if (userSocketMap[userId]) {
        delete userSocketMap[userId]
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
        io.emit("presence:offline", { userId })
    }
}

// this is for storing online users

const userSocketMap: Record<string, Set<string>> = {}; // {userid: socketIds}
const offlineTimers: Record<string, NodeJS.Timeout> = {};
const OFFLINE_GRACE_MS = 15000;

io.on("connection", (s: Socket) => {
    const socket = s as AuthenticatedSocket

    console.log("A User Connected", socket.user?.fullName)

    const userId = socket.userId!
    if (!userSocketMap[userId]) {
        userSocketMap[userId] = new Set();
    }
    userSocketMap[userId].add(socket.id);
    if (offlineTimers[userId]) {
        clearTimeout(offlineTimers[userId]);
        delete offlineTimers[userId];
    }

    // io.emit() is used to send events to all connected users
    io.emit("getOnlineUsers", Object.keys(userSocketMap))
    io.emit("presence:online", { userId })

    socket.on("disconnect", () => {
        console.log("A User Disconnected", socket?.user?.fullName)
        const sockets = userSocketMap[userId];
        if (sockets) {
            sockets.delete(socket.id);
            if (sockets.size === 0) {
                offlineTimers[userId] = setTimeout(() => {
                    delete userSocketMap[userId];
                    delete offlineTimers[userId];
                    io.emit("getOnlineUsers", Object.keys(userSocketMap))
                    io.emit("presence:offline", { userId })
                }, OFFLINE_GRACE_MS);
            }
        }
    })
});

export {io, app, server}
