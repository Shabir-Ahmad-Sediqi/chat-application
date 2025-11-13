import mongoose, { Document, Types } from "mongoose";

export interface IUser extends Document{
    _id: Types.ObjectId,
    fullName: string,
    email: string,
    password: string,
    profilePic?: string
};


const userSchema = new mongoose.Schema<IUser>({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    profilePic: {
        type: String,
        default: ""
    }

}, {timestamps: true} // CreatedAT & UpdatedAt
);

const User = mongoose.model<IUser>("User", userSchema);

export default User
