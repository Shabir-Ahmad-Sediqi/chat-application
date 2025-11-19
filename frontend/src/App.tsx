import { Route, Routes } from "react-router"

import ChatPage from "./pages/chatPage"
import LoginPage from "./pages/loginPage"
import SignUpPage from "./pages/signUpPage"
import { useAuthStore } from "./store/useAuthStore"

function App() {

  const { authUser, isLoggedIn, login } = useAuthStore() as {
    authUser: any;
    isLoggedIn: boolean;
    login: () => void;
  };
  console.log("auth user", authUser)
  console.log("Is LOGGED IN", isLoggedIn)

  return (
    <div className="min-h-screen bg-slate-900 relative flex items-center
    justify-center p-4 overflow-hidden">

      {/* DECORATROS - GRID BG & GLOW SHIPES */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
    <div className="absolute top-0 -left-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
    <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px]" />

    <Routes>
      <Route path="/" element={<ChatPage/>}/>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/signup" element={<SignUpPage/>}/>
    </Routes>
    </div>
  )
}

export default App
