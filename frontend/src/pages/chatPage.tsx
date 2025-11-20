import ActiveTabSwitch from "../components/activeTabSwitch"
import BorderAnimatedContainer from "../components/borderAnimatedContainer"
import ChatContainer from "../components/chatContainer"
import ChatsList from "../components/chatList"
import ContactList from "../components/contactList"
import NoConversationPlaceholder from "../components/noConversationPlaceholder"
import ProfileHeader from "../components/profileHeader"
import { useMessageStore } from "../store/useMessageStore"

function ChatPage() {
  const {activeTab, selectedUser} = useMessageStore()
  return (
    <div className="relative w-full max-w-full h-[650px]">
      
      <BorderAnimatedContainer>
        {/* LEFT-SIDE */}
        <div className="w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col">
          <ProfileHeader/>
          <ActiveTabSwitch/>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList/> : <ContactList/>}
          </div>
        </div>
        {/* RIGHT-SIDE */}
        <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm">
          {selectedUser ? <ChatContainer/> : <NoConversationPlaceholder/>}
        </div>
      </BorderAnimatedContainer>
    </div>
    
  )
}

export default ChatPage