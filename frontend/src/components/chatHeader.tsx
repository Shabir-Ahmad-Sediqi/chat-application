import { useEffect, useState } from "react";
import { useMessageStore } from "../store/useMessageStore";
import { MoreVerticalIcon, XIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader() {
  const {
    selectedUser,
    setSelectedUser,
    isSelectedUserDeleted,
    isSelectedUserBlocked,
    isSelectedUserBlockingMe,
    blockUser,
    unblockUser,
    hideChat
  } = useMessageStore();
  const { onlineUsers } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

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
  const bioText = selectedUser?.bio?.trim() ? selectedUser?.bio : "No bio yet";
  const displayName = isSelectedUserDeleted ? "Deleted User" : selectedUser?.fullName || "Unknown";
  const avatarSrc = isSelectedUserDeleted ? "/avatar.png" : selectedUser?.profilePic || "/avatar.png";

  const handleDeleteChat = async () => {
    if (!selectedUser?._id) return;
    const confirmed = window.confirm(
      `Delete chat with ${selectedUser.fullName || "this user"}? This removes the chat from your list.`
    );
    if (!confirmed) return;
    await hideChat(selectedUser._id);
    setMenuOpen(false);
  };

  const handleBlockToggle = async () => {
    if (!selectedUser?._id) return;
    if (isSelectedUserBlocked) {
      await unblockUser(selectedUser._id);
    } else {
      const confirmed = window.confirm(
        `Block ${selectedUser.fullName || "this user"}? You will no longer be able to message each other.`
      );
      if (!confirmed) return;
      await blockUser(selectedUser._id);
    }
    setMenuOpen(false);
  };

  return (
    <div
      className="
        sticky top-0 z-20
        flex items-center justify-between
        bg-slate-800/50 border-b border-slate-700/50
        px-4 md:px-6 py-3 md:py-4
        min-h-[84px] w-full
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
              src={avatarSrc}
              alt={displayName}
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
            {displayName}
            </h3>
            <p className="text-slate-400 text-sm">
            {isSelectedUserDeleted ? "Deleted" : isOnline ? "Online" : "Offline"}
            </p>
          {selectedUser && !isSelectedUserDeleted && (
            <p className="text-slate-500 text-xs truncate max-w-[180px] sm:max-w-[260px]">
              {bioText}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 relative">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Open chat menu"
          className="p-2 rounded hover:bg-slate-700/30"
        >
          <MoreVerticalIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors" />
        </button>
        {menuOpen && (
          <div className="absolute right-10 top-10 z-30 w-44 rounded-lg border border-slate-700/50 bg-slate-800/90 backdrop-blur-sm shadow-lg">
            <button
              className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700/50"
              onClick={handleDeleteChat}
            >
              Delete chat
            </button>
            {!isSelectedUserDeleted && (
              <button
                className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700/50"
                onClick={handleBlockToggle}
              >
                {isSelectedUserBlocked ? "Unblock user" : "Block user"}
              </button>
            )}
            {isSelectedUserBlockingMe && (
              <div className="px-3 py-2 text-xs text-slate-400">
                You are blocked
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => setSelectedUser(null)}
          aria-label="Close chat"
          className="p-2 rounded hover:bg-slate-700/30"
        >
          <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors" />
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;
