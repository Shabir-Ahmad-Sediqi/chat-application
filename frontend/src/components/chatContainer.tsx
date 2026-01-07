import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useMessageStore } from "../store/useMessageStore";
import ChatHeader from "./chatHeader";
import NoChatHistoryPlaceholder from "./noChatHistoryPlaceholder";
import MessageInput from "./messageInput";
import MessageLoadingSkelaton from "./messageLoadingSkelaton";
import { resolveAssetUrl } from "../libs/config";

type ImageAttachment = {
  url: string;
  signedUrl?: string;
  width?: number;
  height?: number;
  fileName?: string;
};

const ImageAttachmentCard = ({
  attachment,
  onOpen
}: {
  attachment: ImageAttachment;
  onOpen: (url: string) => void;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [ratio, setRatio] = useState(
    attachment.width && attachment.height ? attachment.width / attachment.height : 4 / 3
  );
  const url = resolveAssetUrl(attachment.signedUrl || attachment.url);

  return (
    <button
      type="button"
      onClick={() => onOpen(url)}
      className="block w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
    >
      <div
        className="relative w-full overflow-hidden rounded-lg bg-slate-800/60 transition-all"
        style={{ aspectRatio: ratio }}
      >
        {!isLoaded && <div className="absolute inset-0 animate-pulse bg-slate-700/40" />}
        <img
          src={url}
          alt={attachment.fileName || "Shared image"}
          className="absolute inset-0 h-full w-full object-contain"
          onLoad={(event) => {
            const target = event.currentTarget;
            if (target.naturalWidth && target.naturalHeight) {
              setRatio(target.naturalWidth / target.naturalHeight);
            }
            setIsLoaded(true);
          }}
        />
      </div>
    </button>
  );
};

function ChatContainer() {
  const {
    selectedUser,
    getMessagesById,
    messages,
    isMessagesLoading,
    isSelectedUserDeleted,
    isSelectedUserBlocked,
    isSelectedUserBlockingMe
  } = useMessageStore();
  const authUser = useAuthStore((state) => state.authUser);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);

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
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  useEffect(() => {
    if (!composerRef.current || !listRef.current) return;
    const listEl = listRef.current;
    const update = () => {
      const height = composerRef.current?.offsetHeight ?? 0;
      listEl.style.setProperty("--composer-height", `${height}px`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(composerRef.current);
    return () => observer.disconnect();
  }, []);

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
      <div
        ref={listRef}
        className="chat-scroll flex-1 px-4 md:px-6 overflow-y-auto py-6 md:py-8 min-h-0"
      >
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="space-y-6">
            {messages.map((msg) => {
              const imageAttachments =
                msg.attachments?.filter((attachment) => attachment.type === "image") ?? [];
              const fileAttachments =
                msg.attachments?.filter((attachment) => attachment.type === "file") ?? [];
              const legacyImage = !imageAttachments.length && msg.image ? [{ url: msg.image }] : [];
              const allImages = [...imageAttachments, ...legacyImage];
              const isMultiImage = allImages.length > 1;

              return (
                <div
                  key={msg._id}
                  className={`chat ${msg.senderId === authUser?._id ? "chat-end" : "chat-start"}`}
                >
                  <div
                    className={`chat-bubble relative max-w-[92%] md:max-w-[70%] break-words ${
                      msg.senderId === authUser?._id
                        ? "bg-cyan-600 text-slate-950"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    {allImages.length > 0 && (
                      <div className={isMultiImage ? "grid grid-cols-2 gap-2" : "space-y-2"}>
                        {allImages.map((attachment, index) => (
                          <div
                            key={`${attachment.url}-${index}`}
                            className={`${
                              isMultiImage ? "" : "max-w-[95%] sm:max-w-[85%] md:max-w-[440px]"
                            }`}
                          >
                            <ImageAttachmentCard
                              attachment={attachment as ImageAttachment}
                              onOpen={setActiveImageUrl}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {fileAttachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {fileAttachments.map((attachment, index) => (
                          <a
                            key={`${attachment.url}-${index}`}
                            href={resolveAssetUrl(attachment.signedUrl || attachment.url)}
                            download={attachment.fileName}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2 text-sm hover:bg-black/30"
                          >
                            <span className="font-medium min-w-0 flex-1 break-words">
                              {attachment.fileName || "File"}
                            </span>
                            <span className="text-xs opacity-80 whitespace-nowrap">
                              {formatFileSize(attachment.fileSize)}
                            </span>
                          </a>
                        ))}
                      </div>
                    )}

                    {msg.text && <p className="mt-2 whitespace-pre-wrap">{msg.text}</p>}
                    <p className="text-xs mt-2 opacity-75 flex items-center gap-1">
                      {new Date(msg.createdAt).toLocaleDateString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessageLoadingSkelaton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser?.fullName} />
        )}
      </div>

      {activeImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActiveImageUrl(null)}
        >
          <img
            src={activeImageUrl}
            alt="Full preview"
            className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain"
          />
        </div>
      )}

      {/* Input area - keep fixed at bottom, safe-area aware */}
      <div
        ref={composerRef}
        className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/60 to-transparent pt-2 pb-safe md:pb-4"
      >
        <div className="px-4 md:px-6 max-w-5xl mx-auto">
          <MessageInput />
        </div>
      </div>
    </div>
  );
}

export default ChatContainer;
