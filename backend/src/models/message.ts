
import mongoose, {Document, Model} from "mongoose";

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  text?: string;
  image?: string;
  attachments?: {
    id: string;
    type: "image" | "file";
    url: string;
    signedUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    width?: number;
    height?: number;
  }[];
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
            type: String,
            trim: true,
            maxlength: 2000
        },
        image: {
            type: String
        },
        attachments: [
          {
            id: {
              type: String,
              required: true
            },
            type: {
              type: String,
              enum: ["image", "file"],
              required: true
            },
            url: {
              type: String,
              required: true
            },
            signedUrl: {
              type: String
            },
            fileName: {
              type: String
            },
            fileSize: {
              type: Number
            },
            mimeType: {
              type: String
            },
            width: {
              type: Number
            },
            height: {
              type: Number
            }
          }
        ]
    },
    {timestamps: true}
);

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, senderId: 1, createdAt: -1 });

messageSchema.pre("validate", function (next){
    const hasText = typeof this.text === "string" && this.text.trim().length > 0;
    const hasImage = typeof this.image === "string" && this.image.trim().length > 0;
    const hasAttachments = Array.isArray(this.attachments) && this.attachments.length > 0;

    if (!hasText && !hasImage && !hasAttachments){
        return next(new Error("text or attachment is required"))
    }
    next()
})

const Message: Model<IMessage> =
  (mongoose.models.Message as Model<IMessage>) ||
  mongoose.model<IMessage>("Message", messageSchema);

export default Message
