import { create } from "zustand";
import { axiosInstance } from "../libs/axios";
import toast from "react-hot-toast";

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
};

interface SignUpPayload{
    fullName: string,
    email: string,
    password: string
}

interface AuthStore {
  authUser: User | null;
  isCheckingAuth: boolean;
  isSigningUp: boolean;
  checkAuth: () => Promise<void>;
  signup: (data: SignUpPayload) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get<ApiResponse<User>>("/auth/check");
      if (res.data.success && res.data.data) set({ authUser: res.data.data });
    } catch (error) {
      console.log(`Error in authCheck ${error}`);
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
}));
