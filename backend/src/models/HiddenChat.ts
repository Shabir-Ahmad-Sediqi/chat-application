import mongoose, { Document, Model } from "mongoose";

export interface IHiddenChat extends Document {
  ownerId: mongoose.Types.ObjectId;
  otherUserId: mongoose.Types.ObjectId;
  hiddenAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const hiddenChatSchema = new mongoose.Schema<IHiddenChat>(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    otherUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hiddenAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

hiddenChatSchema.index({ ownerId: 1, otherUserId: 1 }, { unique: true });
hiddenChatSchema.index({ ownerId: 1, hiddenAt: 1 });

const HiddenChat: Model<IHiddenChat> =
  (mongoose.models.HiddenChat as Model<IHiddenChat>) ||
  mongoose.model<IHiddenChat>("HiddenChat", hiddenChatSchema);

export default HiddenChat;
