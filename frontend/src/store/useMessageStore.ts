import { create } from "zustand";
import { axiosInstance } from "../libs/axios";
import toast from "react-hot-toast";

export interface User {
  _id: string;
  name?: string;
  email?: string;
  avatar?: string;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface MessageStore{
    allContacts: User[],
    chats: User[],
    messages: Message[],
    activeTab: string,
    selectedUser: User | null,
    isUsersLoading: boolean,
    isMessagesLoading: boolean,
    isSoundEnabled: boolean,

    // functions
    toggleSound: () => void,
    setActiveTab: (tab: string) => void,
    setSelectedUser: (user: User | null) => void,
    getAllContacts: () => Promise<void>,
    getChatPartners: () => Promise<void>,

}

export const useMessageStore = create<MessageStore>((set, get) => ({
    allContacts: [],
    chats: [],
    messages: [],
    activeTab: "chats",
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isSoundEnabled: localStorage.getItem("isSoundEnabled") === "true",

    toggleSound: () => {
        localStorage.setItem("isSoundEnabled", String(!get().isSoundEnabled));
        set({isSoundEnabled: !get().isSoundEnabled})
    },

    setActiveTab: (tab) => set({activeTab: tab}),
    setSelectedUser: (selectedUser) => set({selectedUser}),

    getAllContacts: async () => {
        set({isUsersLoading: true});
        try{
            const res = await axiosInstance.get("/message/getcontacts");
            if (res.data.success && res.data.data){
                set({allContacts: res.data.data})
            }
        } catch(error: any){
            const message =
            error?.response?.data?.message ?? error?.message ?? "Fetching allContacts Failed";
            toast.error(message);
        }finally{
            set({isUsersLoading: false})
        }
    },

    getChatPartners: async () => {
        set({isUsersLoading: true});
        try{
            const res = await axiosInstance.get("/message/chats");
            if (res.data.success && res.data.data){
                set({chats: res.data.data})
            }
        } catch(error: any){
            const message =
            error?.response?.data?.message ?? error?.message ?? "Fetching chatPartners Failed";
            toast.error(message);
        }finally{
            set({isUsersLoading: false})
        }
    },
}));