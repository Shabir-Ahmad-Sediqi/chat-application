import React, { useRef, useState } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useMessageStore } from "../store/useMessageStore";
import { FileIcon, ImageIcon, SendIcon, XIcon } from "lucide-react";
import toast from "react-hot-toast";

type AttachmentItem = {
  id: string;
  file: File;
  previewUrl?: string;
  type: "image" | "file";
};

function MessageInput() {
  const { playRandomKeyStrokeSounds } = useKeyboardSound();
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isSending, setIsSending] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    sendMessage,
    isSoundEnabled,
    isSelectedUserDeleted,
    isSelectedUserBlocked,
    isSelectedUserBlockingMe
  } = useMessageStore();
  const maxFileSize = 5 * 1024 * 1024;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText && attachments.length === 0) {
      toast.error("Type a message or add an attachment.");
      return;
    }
    if (isSelectedUserDeleted || isSelectedUserBlocked || isSelectedUserBlockingMe) return;
    if (isSending) return;
    if (isSoundEnabled) playRandomKeyStrokeSounds();

    const formData = new FormData();
    if (trimmedText) formData.append("text", trimmedText);
    attachments.forEach((attachment) => formData.append("attachments", attachment.file));
    setIsSending(true);
    await sendMessage(formData);
    setIsSending(false);

    setText("");
    attachments.forEach((attachment) => attachment.previewUrl && URL.revokeObjectURL(attachment.previewUrl));
    setAttachments([]);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const nextAttachments = [...attachments];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed.");
        continue;
      }
      if (file.size > maxFileSize) {
        toast.error("Image exceeds 5MB limit.");
        continue;
      }
      const previewUrl = URL.createObjectURL(file);
      nextAttachments.push({
        id: `${file.name}-${file.lastModified}`,
        file,
        previewUrl,
        type: "image"
      });
    }
    setAttachments(nextAttachments.slice(0, 5));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const nextAttachments = [...attachments];
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        toast.error("Use the image picker for images.");
        continue;
      }
      if (file.size > maxFileSize) {
        toast.error("File exceeds 5MB limit.");
        continue;
      }
      nextAttachments.push({
        id: `${file.name}-${file.lastModified}`,
        file,
        type: "file"
      });
    }
    setAttachments(nextAttachments.slice(0, 5));
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const next = prev.filter((attachment) => attachment.id !== id);
      const removed = prev.find((attachment) => attachment.id === id);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  return (
    <div className="p-4 border-t border-slate-700/50">
      {attachments.length > 0 && (
        <div className="max-w-3xl mx-auto mb-3 flex flex-wrap gap-3">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="relative">
              {attachment.type === "image" ? (
                <img
                  src={attachment.previewUrl}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border border-slate-700"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg border border-slate-700 bg-slate-800/60 flex flex-col items-center justify-center text-xs text-slate-200">
                  <FileIcon className="w-5 h-5 mb-1" />
                  <span className="px-1 truncate max-w-[70px]">{attachment.file.name}</span>
                </div>
              )}
              <button
                onClick={() => removeAttachment(attachment.id)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
                type="button"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex space-x-3">
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            isSoundEnabled && playRandomKeyStrokeSounds();
          }}
          disabled={isSelectedUserDeleted || isSelectedUserBlocked || isSelectedUserBlockingMe}
          className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg py-3 px-4 text-sm md:text-base disabled:opacity-50"
          placeholder={
            isSelectedUserDeleted
              ? "This user has been deleted."
              : isSelectedUserBlocked
              ? "You blocked this user."
              : isSelectedUserBlockingMe
              ? "You are blocked by this user."
              : "Type your message"
          }
        />
        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          onChange={handleImageChange}
          className="hidden"
          multiple
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />

        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={isSelectedUserDeleted || isSelectedUserBlocked || isSelectedUserBlockingMe}
          className={`bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-lg h-11 w-11 flex items-center justify-center transition-colors disabled:opacity-50 ${
            attachments.some((attachment) => attachment.type === "image") ? "text-cyan-500" : ""
          }`}
        >
          <ImageIcon className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSelectedUserDeleted || isSelectedUserBlocked || isSelectedUserBlockingMe}
          className={`bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-lg h-11 w-11 flex items-center justify-center transition-colors disabled:opacity-50 ${
            attachments.some((attachment) => attachment.type === "file") ? "text-cyan-500" : ""
          }`}
        >
          <FileIcon className="w-5 h-5" />
        </button>
        <button
          type="submit"
          disabled={
            isSending ||
            isSelectedUserDeleted ||
            isSelectedUserBlocked ||
            isSelectedUserBlockingMe ||
            (!text.trim() && attachments.length === 0)
          }
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 rounded-lg h-11 w-11 flex items-center justify-center
                font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50
                disabled:cursor-not-allowed"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
