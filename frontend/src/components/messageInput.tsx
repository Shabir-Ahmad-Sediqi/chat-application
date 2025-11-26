
import React, { useRef, useState } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound"
import { useMessageStore } from "../store/useMessageStore";
import { ImageIcon, SendIcon, XIcon } from "lucide-react";

function MessageInput() {

  const {playRandomKeyStrokeSounds} = useKeyboardSound();
  const [text, setText] = useState("");
  const [fileToUpload, setFileToUpload] = useState<File | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement >(null);
  const {sendMessage, isSoundEnabled} = useMessageStore()

  const handleSendImage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text && imagePreview) return;
    if (isSoundEnabled) playRandomKeyStrokeSounds();

    const formData = new FormData();
    if (text.trim()) formData.append("text", text.trim());
    if (fileToUpload) formData.append("image", fileToUpload);
    sendMessage(formData)
    // Remove everything
    setText("")
    setFileToUpload(undefined)
    setImagePreview(undefined)
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

   const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
      if (!file) return;
      // Preview for UI only
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      // Real file to upload
      setFileToUpload(file);   // <--- THIS IS WHAT BACKEND NEEDS
    };

    const removeImage = () => {
        setImagePreview(undefined)
    if (fileInputRef.current) fileInputRef.current.value = "";
    }

  return (
    <div className="p-4 border-t border-slate-700/50">
        {imagePreview && (
        <div className="max-w-3xl mx-auto mb-3 flex items-center">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-slate-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
              type="button"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        )}

        <form onSubmit={handleSendImage} className="max-w-3xl mx-auto flex space-x-4">
            <input 
                type="text"
                value={text}
                onChange={(e) => {
                    setText(e.target.value)
                    isSoundEnabled && playRandomKeyStrokeSounds();
                }}
                className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 px-4 "
                placeholder="Type your message"/>
            <input
                type="file"
                accept="image/*" 
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden" />

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-lg px-4 transition-colors ${
                    imagePreview ? "text-cyan-500" : ""
                }`}
                >
                <ImageIcon className="w-5 h-5" />
                </button>
                <button
                type="submit"
                disabled={!text.trim() && !imagePreview}
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg px-4 py-2
                font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50
                disabled:cursor-not-allowed"
                >
                <SendIcon className="w-5 h-5" />
            </button>
        </form>
    </div>
  )
}

export default MessageInput