import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useMessageStore } from "../store/useMessageStore";
import ChatHeader from "./chatHeader";
import NoChatHistoryPlaceholder from "./noChatHistoryPlaceholder";
import MessageInput from "./messageInput";
import MessageLoadingSkelaton from "./messageLoadingSkelaton";

function ChatContainer() {
  const { 
    selectedUser,
    getMessagesById,
    messages,
    isMessagesLoading,
    subscribeToMessage,
    unSubscribeFromMessage } = useMessageStore();
  const authUser = useAuthStore((state) => state.authUser);

  // use a div ref for scroll target
  const scrolRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof selectedUser?._id !== "string") {
      console.log("ID is undefined in chatcontainer");
      return;
    }
    getMessagesById(selectedUser?._id);
    subscribeToMessage()

    // clean up

    return () => unSubscribeFromMessage()
    
  }, [selectedUser?._id, getMessagesById, subscribeToMessage, unSubscribeFromMessage]);

  useEffect(() => {
    if (scrolRef.current) {
      // scrollIntoView on the sentinel div so list scrolls to bottom
      scrolRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <ChatHeader />

      {/* messages area */}
      <div className="flex-1 px-4 md:px-6 overflow-y-auto py-6 md:py-8 min-h-0">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${msg.senderId === authUser?._id ? "chat-end" : "chat-start"}`}
              >
                <div
                  className={`chat-bubble relative max-w-[80%] md:max-w-[70%] break-words ${
                    msg.senderId === authUser?._id
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-white"
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="shared"
                      className="rounded-lg w-full h-auto max-h-48 object-cover"
                    />
                  )}
                  {msg.text && <p className="mt-2 whitespace-pre-wrap">{msg.text}</p>}
                  <p className="text-xs mt-2 opacity-75 flex items-center gap-1">
                    {new Date(msg.createdAt).toLocaleDateString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {/* sentinel to scroll to bottom */}
            <div ref={scrolRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessageLoadingSkelaton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser?.fullName} />
        )}
      </div>

      {/* Input area - keep fixed at bottom, safe-area aware */}
      <div className="sticky bottom-0 bg-gradient-to-t from-slate-900/60 to-transparent pt-2 pb-safe md:pb-4">
        <div className="px-4 md:px-6">
          <MessageInput />
        </div>
      </div>
    </div>
  );
}

export default ChatContainer;
