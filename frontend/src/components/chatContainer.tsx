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
    isSelectedUserDeleted,
    isSelectedUserBlocked,
    isSelectedUserBlockingMe } = useMessageStore();
  const authUser = useAuthStore((state) => state.authUser);

  // use a div ref for scroll target
  const scrolRef = useRef<HTMLDivElement | null>(null);
  const formatFileSize = (size?: number) => {
    if (!size && size !== 0) return "";
    const units = ["B", "KB", "MB", "GB"];
    let value = size;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex += 1;
    }
    return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };

  useEffect(() => {
    if (typeof selectedUser?._id !== "string") {
      console.log("ID is undefined in chatcontainer");
      return;
    }
    getMessagesById(selectedUser?._id);
  }, [selectedUser?._id, getMessagesById]);

  useEffect(() => {
    if (scrolRef.current) {
      // scrollIntoView on the sentinel div so list scrolls to bottom
      scrolRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <ChatHeader />

      {isSelectedUserDeleted && (
        <div className="mx-4 md:mx-6 mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          This user has been deleted. You can view past messages, but sending is disabled.
        </div>
      )}
      {isSelectedUserBlocked && (
        <div className="mx-4 md:mx-6 mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          You blocked this user. Messaging is disabled.
        </div>
      )}
      {isSelectedUserBlockingMe && (
        <div className="mx-4 md:mx-6 mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          You are blocked by this user. Messaging is disabled.
        </div>
      )}

      {/* messages area */}
      <div className="flex-1 px-4 md:px-6 overflow-y-auto py-6 md:py-8 min-h-0 pb-28 md:pb-8">
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
                      ? "bg-cyan-600 text-slate-950"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {(() => {
                    const imageAttachments = msg.attachments?.filter((attachment) => attachment.type === "image") ?? [];
                    const fileAttachments = msg.attachments?.filter((attachment) => attachment.type === "file") ?? [];
                    const legacyImage = !imageAttachments.length && msg.image ? [{ url: msg.image }] : [];

                    return (
                      <>
                        {[...imageAttachments, ...legacyImage].length > 0 && (
                          <div className="grid grid-cols-2 gap-2">
                            {[...imageAttachments, ...legacyImage].map((attachment, index) => (
                              <img
                                key={`${attachment.url}-${index}`}
                                src={attachment.url}
                                alt="shared"
                                className="rounded-lg w-full h-auto max-h-48 object-cover"
                              />
                            ))}
                          </div>
                        )}

                        {fileAttachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {fileAttachments.map((attachment, index) => (
                              <a
                                key={`${attachment.url}-${index}`}
                                href={attachment.url}
                                download={attachment.fileName}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2 text-sm hover:bg-black/30"
                              >
                                <span className="font-medium truncate max-w-[160px]">
                                  {attachment.fileName || "File"}
                                </span>
                                <span className="text-xs opacity-80">
                                  {formatFileSize(attachment.fileSize)}
                                </span>
                              </a>
                            ))}
                          </div>
                        )}

                        {msg.text && <p className="mt-2 whitespace-pre-wrap">{msg.text}</p>}
                      </>
                    );
                  })()}
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
      <div className="fixed md:sticky bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/60 to-transparent pt-2 pb-safe md:pb-4">
        <div className="px-4 md:px-6 max-w-5xl mx-auto">
          <MessageInput />
        </div>
      </div>
    </div>
  );
}

export default ChatContainer;
