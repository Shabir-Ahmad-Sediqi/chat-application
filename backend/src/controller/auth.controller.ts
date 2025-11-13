
import { Request, Response } from "express"
import User, {IUser} from "../models/User.js";
import bcrypt from "bcryptjs"
import { generateToken } from "../lib/utils.js";
import { sendWelcomeEmail } from "../emails/emailHandler.js";
import "dotenv/config"

interface ApiResponse<T>{
    success: boolean;
    data?: T;
    message?: string
}
interface PublicUserResponse {
  _id: string;
  fullName: string;
  email: string;
  profilePic?: string;
}

export const signUpHandler = async (req: Request, res: Response<ApiResponse<PublicUserResponse>>) => {
    const {fullName, email, password} = req.body
    const emailReges = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    try{
        if (!fullName || !email || !password){
            return res.status(400).json({success: false, message: "Invalid Credentials!"});
        };
        // check if password is 8 chars long
        if (password.length < 8){
            return res.status(400).json({success: false, message: "Password must be at least 8 characters long!"});
        }; 
        // check if email is valid
        if (!emailReges.test(email)){
            return res.status(400).json({success: false, message: "Invalid Email"});
        }

        const user = await User.findOne({email});

        // check if user exists
        if (user){
            return res.status(400).json({success: false, message: "User with this email already exist"})
        };

        // Hash the password 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        if (newUser){
            await newUser.save();
            generateToken(newUser._id, res);
            
            res.status(201).json({
                success: true,
                data: {
                    _id: newUser._id.toString(),
                    fullName: newUser.fullName,
                    email: newUser.email,
                    profilePic: newUser.profilePic
                }
            })

            // send welcome email

            try{
                const fromAddress = process.env.CLIENT_URL;
                if (!fromAddress) {
                    console.warn("EMAIL_FROM not configured; skipping welcome email.");
                } else {
                    await sendWelcomeEmail(newUser.email, newUser.fullName, fromAddress);
                }
            }catch(error){
                console.log(`Failed to send email ${error}`)
            }
        }else{
            res.status(400).json({success: false, message: "Invalid Data"})
        }


    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return res.status(500).json({success: false, message});
    }
};

export const loginHandler = (req: Request, res: Response<ApiResponse<string>>) => {
    
};

export const logoutHandler = (req: Request, res: Response<ApiResponse<string>>) => {
    res.status(200).json({success: true, message: "Logout "})
}
