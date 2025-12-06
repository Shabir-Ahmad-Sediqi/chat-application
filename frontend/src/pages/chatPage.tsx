import { useState } from "react";
import ActiveTabSwitch from "../components/activeTabSwitch";
import BorderAnimatedContainer from "../components/borderAnimatedContainer";
import ChatContainer from "../components/chatContainer";
import ChatsList from "../components/chatList";
import ContactList from "../components/contactList";
import NoConversationPlaceholder from "../components/noConversationPlaceholder";
import ProfileHeader from "../components/profileHeader";
import { useMessageStore } from "../store/useMessageStore";

function ChatPage() {
  const { activeTab, selectedUser } = useMessageStore();

  // ONLY for mobile drawer, nothing else
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative w-full h-screen max-h-screen">
      <BorderAnimatedContainer>

        {/* LEFT SIDEBAR — becomes drawer on mobile */}
        <div
          className={`
            fixed inset-y-0 left-0 z-40 w-72 bg-slate-800/50 backdrop-blur-sm flex flex-col
            transform transition-transform duration-300 ease-in-out
            md:translate-x-0 md:relative md:w-80
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="flex items-center justify-between md:hidden p-3">
            <ProfileHeader />
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded hover:bg-slate-700/30"
            >
              ✕
            </button>
          </div>

          <div className="hidden md:block">
            <ProfileHeader />
            <ActiveTabSwitch />
          </div>

          <div className="md:hidden px-4">
            <ActiveTabSwitch />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* OVERLAY — mobile only */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* RIGHT SIDE */}
        <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm h-screen">

          {/* Mobile top bar */}
          <div className="md:hidden flex items-center gap-3 p-3 border-b border-slate-700/30">
            <button
              className="p-2 rounded hover:bg-slate-700/30"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <span className="text-sm">
              {selectedUser ? selectedUser.fullName : "Messages"}
            </span>
          </div>

          <div className="flex-1 min-h-0">
            {selectedUser ? (
              <ChatContainer />
            ) : (
              <NoConversationPlaceholder />
            )}
          </div>
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}

export default ChatPage;
 