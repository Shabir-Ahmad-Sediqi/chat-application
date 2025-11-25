import { create } from "zustand";
import { axiosInstance } from "../libs/axios";
import toast from "react-hot-toast";

interface ApiResponse<T>{
    success: boolean;
    data: T;
    message?: string
};
interface User {
  _id: string;
  fullName: string;
  email: string;
  profilePic?: string;
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
  isCheckingAuth: boolean;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  checkAuth: () => Promise<void>;
  signup: (data: SignUpPayload) => Promise<void>;
  login: (data: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get<ApiResponse<User>>("/auth/check");
      console.log(`After sending request ${res}`)
      if (res.data.success && res.data.data){
        set({ authUser: res.data.data });
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
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post<ApiResponse<User>>("/auth/signup", data);
      if (res.data.success && res.data.data){
         set({ authUser: res.data.data });
         toast.success("Account created successfully");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? error?.message ?? "Signup failed";
      toast.error(message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data: LoginPayload) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post<ApiResponse<User>>("/auth/login", data);
      if (res.data.success && res.data.data){
         set({ authUser: res.data.data });
         toast.success("Logged In successfully");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? error?.message ?? "Login Failed";
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
  }
}));
