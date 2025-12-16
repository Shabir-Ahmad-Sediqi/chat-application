
import { Request, Response } from "express"
import User, {IUser} from "../models/User.js";
import bcrypt from "bcryptjs"
import { generateToken } from "../lib/utils.js";
import { sendWelcomeEmail } from "../emails/emailHandler.js";
import "dotenv/config"
import imagekit from "../lib/imageKit.js";
import Message from "../models/message.js";

interface ApiResponse<T>{
    success: boolean;
    data?: T;
    message?: string
};
export interface PublicUserResponse {
  _id: string;
  fullName: string;
  email: string;
  profilePic?: string;
};

interface AuthRequest extends Request {
    user?: { _id: string };
    file?: Express.Multer.File; // <- TypeScript knows file exists
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

export const loginHandler = async (req: Request, res: Response<ApiResponse<PublicUserResponse>>) => {

    const {email, password} = req.body;
    if (!email || !password) res.status(400).json({success: false, message: "Both fields are required"})

    try{
        const existingUser = await User.findOne({email});
        if (!existingUser) return res.status(400).json({success: false, message: "Invalid Credentials"});

        const comparePassword = await bcrypt.compare(password, existingUser.password);
        if (!comparePassword)  return res.status(400).json({success: false, message: "Invalid Credentials"});

        generateToken(existingUser._id, res);


        res.status(200).json({
            success: true,
            data: {
                _id: existingUser._id.toString(),
                fullName: existingUser.fullName,
                email: existingUser.email,
                profilePic: existingUser.profilePic
            }
        })
    }
    catch(error){
            res.status(500).json({success: false, message: `Internal server error at the login ${error}`})
        }
};

export const logoutHandler = (req: Request, res: Response<ApiResponse<string>>) => {
    res.cookie("jwt", "", {maxAge: 0})
    res.status(200).json({success: true, message: "Logged out successfully"})
};

export const updateProfile = async (
    req: AuthRequest,
    res: Response<ApiResponse<PublicUserResponse>>
) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const file = req.file;
        console.log(file)
        if (!file) return res.status(400).json({ success: false, message: "No file uploaded" })

        const upload = await imagekit.upload({
            file: file.buffer,
            fileName: file.originalname
        }); 


        if (!upload || !upload.url) {
        return res.status(502).json({ success: false, message: "ImageKit returned invalid response"});
      }
        console.log("ImageKit upload successful:", upload.url);
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: upload.url },
            { new: true }
        );

        if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({
            success: true,
            data: {
                _id: updatedUser._id.toString(),
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                profilePic: updatedUser.profilePic
            }
        });

    } catch (error: any) {
        console.error("Error in updateProfile:", error);
        // Clear catch: check for .message or stringify object
        const message = error?.message || JSON.stringify(error) || "Unknown server error";
        res.status(500).json({ success: false,message:  message });
    }
};

export const isAuthenticated = async (req: AuthRequest, res: Response<ApiResponse<PublicUserResponse>>) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

        const existingUser = await User.findById(userId);
        if (!existingUser) return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({
            success: true,
            data: {
                _id: existingUser._id.toString(),
                fullName: existingUser.fullName,
                email: existingUser.email,
                profilePic: existingUser.profilePic
            }
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false,message: message });
    }
}

export const deleteAccount = async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id
    const { password } = req.body 

    try{
        if (!userId) return res.status(401).json({success: false, message: "Unauthorized"})
        // find the user in the db
        const user = await User.findById(userId)
        if (!user)return res.status(404).json({success: false, message: "User not found"})
        // check if password is not null
        if (!password) return res.status(401).json({success: false, message: "Password is required"})
        // compare password with hashed password
        const comparePassword = await bcrypt.compare(password, user.password)
        if (!comparePassword) return res.status(401).json({success: false, message: "Invalid Credentials"})

        const deletedAt = new Date()
        user.email = `${deletedAt}${user.fullName}@gmail.com`
        user.fullName = "Deleted User"
        await user.save()

        // Anonomize his messages
        // todo Delete the user from contacts list and chat history
     
        res.status(200).json({success: true, message: "User Deleted Successfully"})


    }catch(error: any){
        console.log("Error in delete endpoint catch block ")
        return res.status(500).json({success: false, message: "Internal server error", error})
    }

}
