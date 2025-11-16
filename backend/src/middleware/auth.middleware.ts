import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import "dotenv/config"
import User from "../models/User.js"

interface TokenPayload{
    userId: string
}

export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const token = req.cookies?.jwt
        if(!token) return res.status(401).json({success: false, message: "Unauthorized - No token provided"});

        const secret = process.env.JWT_SECRET
        if (!secret) return res.status(500).json({success: false, message: "Server misconfiguration - Missing JWT_SECRET"});
        const decoded = jwt.verify(token, secret)
        if (typeof decoded === "string" || !('userId' in decoded)) return res.status(401).json({success: false, message: "Unauthorized - Invalid token"});

        const user = await User.findById((decoded as TokenPayload).userId).select("-password")
        if (!user) return res.status(401).json({success: false, message: "Unauthorized - User not found"});

        (req as any).user = user
        next()

    }catch(error){
        return res.status(500).json({success: false, message: "Internal server error"})
    }
}