import { useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore"
import { LogOutIcon, VolumeOffIcon, Volume2Icon } from "lucide-react";
import { useMessageStore } from "../store/useMessageStore";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
    const {logout, authUser, updateProfile} = useAuthStore();
    const {isSoundEnabled, toggleSound} = useMessageStore();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
      if (!file) return;

      // Preview for UI only
      const previewUrl = URL.createObjectURL(file);
      setSelectedImage(previewUrl);

      // Real file to upload
      const formData = new FormData();
      formData.append("profilePic", file);

      await updateProfile(formData);   // <--- THIS IS WHAT BACKEND NEEDS
    }
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

                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                         flex items-center justify-center transition-opacity">
                          <span className="text-white text-xs">Change</span>
                        </div>
                                    
                    </button>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                         />
                </div>
                <div> 
                  <h3 className="text-slate-200 font-medium text-base max-w-[180px] truncate">
                    {authUser?.fullName}
                  </h3>
                  <p className="text-slate-400 text-sm">Online</p>
                </div>
            </div>

            {/* buttons */}

             <div className="flex gap-4 items-center">
              {/* LOGOUT BTN */}
              <button
                className="text-slate-400 hover:text-slate-200 transition-colors"
                onClick={logout}
              >
                <LogOutIcon className="size-5" />
              </button>

          {/* SOUND TOGGLE BTN */}
                <button
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                  onClick={() => {
                    // play click sound before toggling
                    mouseClickSound.currentTime = 0; // reset to start
                    mouseClickSound.play().catch((error) => console.log("Audio play failed:", error));
                    toggleSound();
                  }}
                >
                  {isSoundEnabled ? (
                    <Volume2Icon className="size-5" />
                  ) : (
                    <VolumeOffIcon className="size-5" />
                  )}
                </button>
          </div>
        </div>
    </div>
  )
}

export default ProfileHeader