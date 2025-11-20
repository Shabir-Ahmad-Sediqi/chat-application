import { useAuthStore } from "../store/useAuthStore"

function ChatPage() {
  const {logout} = useAuthStore()
  return (
    <div>
      <button className="btn " onClick={logout}>Logout</button>
    </div>
    
  )
}

export default ChatPage