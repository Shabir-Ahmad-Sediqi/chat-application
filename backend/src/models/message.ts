
import mongoose, {Document, Model} from "mongoose";

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  text?: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const messageSchema = new mongoose.Schema<IMessage>(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        text: {
            type: String
        },
        image: {
            type: String
        }
    },
    {timestamps: true}
);

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

const Message: Model<IMessage> =
  (mongoose.models.Message as Model<IMessage>) ||
  mongoose.model<IMessage>("Message", messageSchema);

export default Message
