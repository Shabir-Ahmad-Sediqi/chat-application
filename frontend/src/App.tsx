import { Route, Routes, useLocation } from "react-router"

import ChatPage from "./pages/chatPage"
import LoginPage from "./pages/loginPage"
import SignUpPage from "./pages/signUpPage"
import SettingsPage from "./pages/settingsPage"
import { useAuthStore } from "./store/useAuthStore"
import { useEffect } from "react"
import { Navigate } from "react-router"
import PageLoader from "./components/pageloader"
import { Toaster } from "react-hot-toast"

function App() {

  const { checkAuth, authUser, isCheckingAuth, theme } = useAuthStore();
  const location = useLocation();
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/signup";
  const isChatRoute = location.pathname === "/";
  const fromLocation = (location.state as { from?: { pathname: string; search?: string } } | null)?.from;
  const redirectTarget = fromLocation ? `${fromLocation.pathname}${fromLocation.search ?? ""}` : "/";
  const wrapperClass = isAuthRoute
    ? "min-h-screen flex items-center justify-center p-4"
    : isChatRoute
    ? "min-h-screen"
    : "min-h-screen p-4 md:p-6";

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  if (authUser === null){
    console.log("auth user is null i dont know why ")
  }


  if (isCheckingAuth) return <PageLoader/>

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-x-hidden">
      <div className={wrapperClass}>
        <Routes>
          <Route
            path="/"
            element={authUser ? <ChatPage /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          <Route
            path="/settings"
            element={authUser ? <SettingsPage /> : <Navigate to="/login" state={{ from: location }} replace />}
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to={redirectTarget} replace />}
          />
          <Route
            path="/signup"
            element={!authUser ? <SignUpPage /> : <Navigate to={redirectTarget} replace />}
          />
        </Routes>
      </div>

      <Toaster />
    </div>
  )
}

export default App
