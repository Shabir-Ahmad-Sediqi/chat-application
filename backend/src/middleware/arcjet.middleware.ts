
import { NextFunction, Request, Response } from "express";
import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";
import { error } from "console";

export const arcjetProtection = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const decision = await aj.protect(req);

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()){
                return res.status(429).json({success: false, message: "Rate limit exceeded, please try again later"})
            }
            else if (decision.reason.isBot()){
                return res.status(403).json({success: false, message: "Bot access denied"});
            }
            else{
                return res.status(403).json({success: false, message: "Access denied by security policy"})
            };
        };

        // check for spoofed bots => that acts as human
        if (decision.results.some(isSpoofedBot)){
            return res.status(403).json({
                success: false,
                error: "Spoofed bot detected",
                message: "Malicious bot activity detected."
            })
        };
        next()
    }catch(error){
        console.log(`Arcjet Protection Error ${error}`)
        next()
    }
}
