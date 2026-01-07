import jwt from "jsonwebtoken"
import { Response } from "express"

export const generateToken = (userId: any, res: Response): string => {
    const secret = process.env.JWT_SECRET
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is not set")
    }
    const sameSite = (process.env.COOKIE_SAMESITE ||
        (process.env.NODE_ENV === "production" ? "lax" : "strict")) as
        | "lax"
        | "strict"
        | "none";
    const secure = process.env.NODE_ENV !== "development" || sameSite === "none";

    const token = jwt.sign({ userId }, secret, {
        expiresIn: "7d"
    });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, /// MS
        httpOnly: true, // prevents XSS attacks: cross site scripting
        sameSite, // CSRF attacks
        secure
    });

    return token
}
