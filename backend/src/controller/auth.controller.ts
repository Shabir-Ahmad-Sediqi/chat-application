
import { Request, Response } from "express"

interface ApiResponse<T>{
    success: boolean;
    data?: T;
    message?: string
}

export const loginHandler = (req: Request, res: Response<ApiResponse<string>>) => {
    res.status(200).json({success: true, message: "Login in "})
}

export const singUpHandler = (req: Request, res: Response<ApiResponse<string>>) => {
    res.status(200).json({success: true, message: "Sing Up "})
}

export const logoutHandler = (req: Request, res: Response<ApiResponse<string>>) => {
    res.status(200).json({success: true, message: "Logout "})
}
