import { useEffect } from "react";
import { useMessageStore } from "../store/useMessageStore";
import { XIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useMessageStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedUser(null);
      }
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  const isOnline =
    Array.isArray(onlineUsers) && selectedUser?._id
      ? onlineUsers.includes(selectedUser!._id)
      : false;

  return (
    <div
      className="
        sticky top-0 z-20
        flex items-center justify-between
        bg-slate-800/50 border-b border-slate-700/50
        px-4 md:px-6 py-3 md:py-4
        max-h-[84px] w-full
      "
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar + online indicator */}
        <div
          className={`relative flex-shrink-0 ${
            isOnline ? "avatar-online" : "avatar-offline"
          }`}
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-slate-700">
            <img
              src={selectedUser?.profilePic || "/avatar.png"}
              alt={selectedUser?.fullName || "avatar"}
              className="w-full h-full object-cover"
            />
          </div>

          {/* small online dot */}
          <span
            aria-hidden
            className={`absolute right-0 bottom-0 block w-2.5 h-2.5 rounded-full ring-1 ring-slate-900 ${
              isOnline ? "bg-emerald-400" : "bg-slate-600"
            }`}
          />
        </div>

        {/* Name / status. truncate on small screens */}
        <div className="min-w-0">
          <h3 className="text-slate-200 font-medium truncate">
            {selectedUser?.fullName || "Unknown"}
          </h3>
          <p className="text-slate-400 text-sm">
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Close button (keeps same behavior) */}
      <button
        onClick={() => setSelectedUser(null)}
        aria-label="Close chat"
        className="p-2 rounded hover:bg-slate-700/30"
      >
        <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors" />
      </button>
    </div>
  );
}

export default ChatHeader;
