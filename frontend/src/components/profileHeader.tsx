import { useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore"
import { LogOutIcon, VolumeOffIcon, Volume2Icon } from "lucide-react";
import { useMessageStore } from "../store/useMessageStore";

function ProfileHeader() {
    const {logout, authUser, updateProfile} = useAuthStore();
    const {isSoundEnabled, toggleSound} = useMessageStore();
    const [selectedImage, setSelectedImage] = useState(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {}
  return (
    <div className="p-6 border-b  border-slate-700/50">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                {/* AVATAR */}
                <div className="avatar online">
                    <button 
                      className="size-14 rounded-full overflow-hidden relative group"
                      onClick={() => fileInputRef.current?.click()}>

                        <img
                         src={selectedImage || authUser?.profilePic || "/avatar.png"}
                         alt="User Image"
                         className="size-full object-cover" />
                         
                    </button>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                         />
                </div>
            </div>
        </div>
    </div>
  )
}

export default ProfileHeader