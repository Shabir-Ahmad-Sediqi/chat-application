import mongoose, { Document, Model } from "mongoose";

export interface IUserBlock extends Document {
  blockerId: mongoose.Types.ObjectId;
  blockedId: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const userBlockSchema = new mongoose.Schema<IUserBlock>(
  {
    blockerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blockedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

userBlockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });
userBlockSchema.index({ blockedId: 1, blockerId: 1 });

const UserBlock: Model<IUserBlock> =
  (mongoose.models.UserBlock as Model<IUserBlock>) ||
  mongoose.model<IUserBlock>("UserBlock", userBlockSchema);

export default UserBlock;
