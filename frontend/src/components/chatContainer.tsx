import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore"
import { useMessageStore } from "../store/useMessageStore"
import ChatHeader from "./chatHeader";
import NoChatHistoryPlaceholder from "./noChatHistoryPlaceholder";



function ChatContainer() {

  const {selectedUser, getMessagesById, messages} = useMessageStore();
  const authUser = useAuthStore(state => state.authUser);

  useEffect(() => {
    if (typeof selectedUser?._id !== "string"){
      console.log("ID is undefined in chatcontainer")
      return
    }
    getMessagesById(selectedUser?._id);
  
  },[selectedUser?._id, getMessagesById])

  return (
    <>
      <ChatHeader/>
      <div className="flex-1 px-6 overflow-y-auto py-8">
        {messages.length > 0 ? (
          <div className=" space-y-6"> // changed for sick of testing
            {messages.map((msg) => (
              <div
               key={msg._id}
               className={`chat ${msg.senderId === authUser?._id ? "chat-end" : "chat-start"}`}
               >
                <div 
                  className={`chat-bubble relative ${
                    msg.senderId === authUser?._id
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-800 text-white"
                  }`}>
                    {msg.image && (
                      <img src={msg.image} alt="shared" className="rounded-lg h-48 object-cover" />
                    )}
                    {msg.text && <p className="mt-2">{msg.text}</p>}
                    <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                      {new Date(msg.createdAt).toISOString().slice(11,16)}
                    </p>
                </div>
              </div>
            ))}
          </div>
        ) : (<NoChatHistoryPlaceholder name={selectedUser?.fullName}/>)}
      </div>
    </>
  )
}

export default ChatContainer