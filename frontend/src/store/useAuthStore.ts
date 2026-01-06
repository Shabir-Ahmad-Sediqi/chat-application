import { create } from "zustand";
import { axiosInstance } from "../libs/axios";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

interface ApiResponse<T>{
    success: boolean;
    data?: T;
    message?: string
};
interface User {
  _id: string;
  fullName: string;
  email: string;
  profilePic?: string;
  username?: string;
  bio?: string;
  theme?: "WHITE_BLUE" | "BLACK_GREEN";
};

interface SignUpPayload{
    fullName: string,
    email: string,
    password: string
};

interface LoginPayload{
    email: string,
    password: string
};

interface AuthStore {
  authUser: User | null;
  theme: "WHITE_BLUE" | "BLACK_GREEN";
  isCheckingAuth: boolean;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  authError: string | null;
  socket: Socket | null
  onlineUsers: string[]
  checkAuth: () => Promise<void>;
  signup: (data: SignUpPayload) => Promise<void>;
  login: (data: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  updateProfileDetails: (data: { fullName?: string; username?: string; bio?: string }) => Promise<void>;
  removeProfileImage: () => Promise<void>;
  updateThemePreference: (theme: "WHITE_BLUE" | "BLACK_GREEN") => Promise<boolean>;
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<boolean>;
  connecSocket: () => void;
  disconnnectSocket: () => void;
  clearAuthError: () => void;
  deleteAccount: (data: { password: string; confirm: string }) => Promise<boolean>
}

const storedTheme = localStorage.getItem("theme");
const initialTheme: "WHITE_BLUE" | "BLACK_GREEN" =
  storedTheme === "WHITE_BLUE" ? "WHITE_BLUE" : "BLACK_GREEN";

export const useAuthStore = create<AuthStore>((set,get) => ({
  authUser: null,
  theme: initialTheme,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  authError: null,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get<ApiResponse<User>>("/auth/check");
      console.log(`After sending request ${res}`)
      if (res.data.success && res.data.data){
        const userTheme = res.data.data.theme;
        if (userTheme) {
          localStorage.setItem("theme", userTheme);
          set({ theme: userTheme });
        }
        set({ authUser: res.data.data });
        get().connecSocket();
        console.log("inside if it means it successed", res.data.data)
      } 
      console.log("After if statement")
    } catch (error: unknown) {
      if (error instanceof Error) {
      console.error("Error in authCheck:", error.message, error.stack);
    } else {
      console.error("Error in authCheck (non-error):", error);
    }
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data: SignUpPayload) => {
    set({ isSigningUp: true, authError: null });
    try {
      const res = await axiosInstance.post<ApiResponse<User>>("/auth/signup", data);
      if (res.data.success && res.data.data){
         set({ authUser: res.data.data });
         if (res.data.data.theme) {
           localStorage.setItem("theme", res.data.data.theme);
           set({ theme: res.data.data.theme });
         }
         toast.success("Account created successfully");
      }
      set({ authError: null });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? error?.message ?? "Signup failed";
      set({ authError: message });
      toast.error(message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data: LoginPayload) => {
    set({ isLoggingIn: true, authError: null });
    try {
      const res = await axiosInstance.post<ApiResponse<User>>("/auth/login", data);
      if (res.data.success && res.data.data){
         set({ authUser: res.data.data });
         if (res.data.data.theme) {
           localStorage.setItem("theme", res.data.data.theme);
           set({ theme: res.data.data.theme });
         }
         toast.success("Logged In successfully");

         get().connecSocket();
      }
      set({ authError: null });
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? error?.message ?? "Login Failed";
      set({ authError: message });
      toast.error(message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try{
      const res = await axiosInstance.post("/auth/logout");
      if (res.data.success){
        set({authUser: null})
        toast.success(res.data.message)
        get().disconnnectSocket()
      }
    }catch(error: any){
      toast.error("Something went wrong")
    }
  },

  updateProfile: async (data) => {
    try{
      const res = await axiosInstance.put<ApiResponse<User>>("/auth/update-profile", data)
      if (res.data.success && res.data.data){
        set({authUser: res.data.data})
        toast.success("Profile Updated Successfully")
      }
    }catch(error: any){
      console.log(`Error in update profile ${error}`)
      const message =
        error?.response?.data?.message ?? error?.message ?? "Error in Update Profile";
      toast.error(message)
    }
  },
  updateProfileDetails: async (data) => {
    try {
      const res = await axiosInstance.patch<ApiResponse<User>>("/auth/me", data);
      if (res.data.success && res.data.data) {
        set({ authUser: res.data.data });
        if (res.data.data.theme) {
          localStorage.setItem("theme", res.data.data.theme);
          set({ theme: res.data.data.theme });
        }
        toast.success("Profile updated");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? error?.message ?? "Error updating profile";
      toast.error(message);
    }
  },
  removeProfileImage: async () => {
    try {
      const res = await axiosInstance.delete<ApiResponse<User>>("/auth/profile-image");
      if (res.data.success && res.data.data) {
        set({ authUser: res.data.data });
        toast.success("Profile photo removed");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? error?.message ?? "Error removing photo";
      toast.error(message);
    }
  },
  updateThemePreference: async (theme) => {
    try {
      const res = await axiosInstance.patch<ApiResponse<User>>("/auth/me", { theme });
      if (res.data.success && res.data.data) {
        localStorage.setItem("theme", theme);
        set({ theme, authUser: res.data.data });
        toast.success("Theme updated");
        return true;
      }
      return false;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? error?.message ?? "Error updating theme";
      toast.error(message);
      return false;
    }
  },
  clearAuthError: () => set({ authError: null }),
  changePassword: async (data) => {
    try {
      const res = await axiosInstance.post<ApiResponse<null>>("/auth/change-password", data);
      if (res.data.success) {
        toast.success("Password updated successfully");
        return true;
      }
      return false;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? error?.message ?? "Error updating password";
      toast.error(message);
      return false;
    }
  },

  connecSocket: () => {
    const {authUser} = get();
    if (!authUser || get().socket?.connected) return

    const socket = io(BASE_URL, {
      withCredentials: true // This ensures cookies are sent with the connection 
    });

    socket.connect();
    set({socket});

    // Litsen for online users events
    socket.on("getOnlineUsers", (userIds) => {
      set({onlineUsers: userIds})
    })
  },

  disconnnectSocket: () => {
    const {socket} = get()
    if (socket?.connected) {
      socket.disconnect();
      set({socket: null})
    }
  },
  deleteAccount: async (data) => {
    try{
      const res = await axiosInstance.post("/auth/delete-account", data);
      if (res.data.success){
        set({authUser: null})
        toast.success("User Deleted Successfully")
        get().disconnnectSocket()
        return true;
    }
      return false;
    }catch(error: any){
      const message =
      error?.response?.data?.message ?? error?.message ?? "Error in Delete Account";
      toast.error(message)
      return false;
    }
    }
  }
));
