import mongoose, { Document, Types } from "mongoose";

export interface IUser extends Document{
    _id: Types.ObjectId,
    fullName: string,
    email: string,
    password: string,
    profilePic?: string,
    username?: string,
    bio?: string,
    passwordChangedAt?: Date,
    deletedAt?: Date | null,
    theme?: "WHITE_BLUE" | "BLACK_GREEN"
    themeSetByUser?: boolean
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
    },
    username: {
        type: String,
        sparse: true,
        trim: true
    },
    bio: {
        type: String,
        default: ""
    },
    passwordChangedAt: {
        type: Date
    },
    deletedAt: {
        type: Date,
        default: null
    },
    theme: {
        type: String,
        enum: ["WHITE_BLUE", "BLACK_GREEN"],
        default: "BLACK_GREEN"
    },
    themeSetByUser: {
        type: Boolean,
        default: false
    }

}, {timestamps: true} // CreatedAT & UpdatedAt
);

userSchema.index(
    { username: 1 },
    { unique: true, partialFilterExpression: { deletedAt: { $eq: null } } }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User
