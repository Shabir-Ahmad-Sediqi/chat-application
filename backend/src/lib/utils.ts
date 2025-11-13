import jwt from "jsonwebtoken"
import { Response } from "express"

export const generateToken = (userId: any, res: Response): string => {
    const secret = process.env.JWT_SECRET
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is not set")
    }

    const token = jwt.sign({ userId }, secret, {
        expiresIn: "7d"
    });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, /// MS
        httpOnly: true, // prevents XSS attacks: cross site scripting
        sameSite: "strict", // CSRF attacks
        secure: process.env.NODE_ENV == "development" ? false : true
    });

    return token
}