import { useEffect } from "react"
import { useMessageStore } from "../store/useMessageStore"
import UsersLoadingSkeleton from "./usersLoadingSkelaton";
import NoChatsFound from "./noChatsFound";
import { useAuthStore } from "../store/useAuthStore";


function ChatsList() {
  const {getChatPartners, chats, isUsersLoading, setSelectedUser} = useMessageStore()
  const {onlineUsers} = useAuthStore()
  
  useEffect(() => {
    getChatPartners()
  }, [getChatPartners]);
  console.log(chats)
  if (isUsersLoading) return <UsersLoadingSkeleton/>
  if (chats.length === 0) return <NoChatsFound/>
  return (
    <>
      {chats.map((chat) => (
        <div 
          key={chat._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover: bg-cyan-500/20 transition-colors"
          onClick={() => setSelectedUser(chat)}
          >
          <div className="flex items-center gap-3">
            <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
              <div className="size-12 rounded-full">
                <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">{chat.fullName}</h4>
          </div>

        </div>
      ))}
    </>
  )
}

export default ChatsList