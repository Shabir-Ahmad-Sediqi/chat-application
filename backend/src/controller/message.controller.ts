import { Request, Response } from "express"

interface ApiResponse<T>{
    success: boolean;
    data?: T;
    message?: string
}

export const sendMessageController = (req: Request, res: Response<ApiResponse<string>>) => {
    res.status(200).json({success: true, message: "Message Sent"})
}