import { create } from "zustand";
import { axiosInstance } from "../libs/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";


export interface User {
  _id: string;
  fullName?: string;
  email?: string;
  profilePic?: string;
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
    getMessagesById: (userId: string) => Promise<void>,
    sendMessage: (messageData: FormData) => Promise<void>,
    subscribeToMessage: () => void,
    unSubscribeFromMessage: () => void,

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

    getMessagesById: async (userId) => {
        set({isMessagesLoading: true});
        try{
            const res = await axiosInstance.get(`/message/${userId}`)
            if (res.data.success){
                set({messages: res.data.data})
            }
        }catch(error: any){
            const message =
            error?.response?.data?.message ?? error?.message ?? "Fetching chatPartners Failed";
            toast.error(message);
        }finally{
            set({isMessagesLoading: false})
        }
    },

    sendMessage: async (messageData) => {
        const {selectedUser, messages} = get()
        const {authUser} = useAuthStore.getState()

        const tempId = `temp-${Date.now()}`
        const message =  messageData.get("text")
        let imageEntry = messageData.get("image")
        if (imageEntry instanceof File){
            imageEntry = URL.createObjectURL(imageEntry)
        }

        const optimisticMessage:Message = {
            _id: tempId,
            senderId: authUser?._id!,
            receiverId: selectedUser?._id!,
            text:message && typeof message === "string" ? message : undefined,
            image: imageEntry && typeof imageEntry === "string" ? imageEntry : undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // isOptimistic: true, // Optional
        }
        set({messages: [ ...messages, optimisticMessage ]})
        try{
            const res = await axiosInstance.post(`/message/send/${selectedUser?._id}`,messageData)
            if (res.data.success & res.data.data){
                set({messages: messages.concat(res.data.data)})
            }
        }catch(error: any){
            set({messages: messages})
            const message =
            error?.response?.data?.message ?? error?.message ?? "Sending Messages Failed";
            toast.error(message);
        }
    },

    subscribeToMessage: () => {
        const {selectedUser, isSoundEnabled} = get()
        if (!selectedUser) return

        const socket = useAuthStore.getState().socket;

        socket?.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage._id === selectedUser._id
            if (!isMessageSentFromSelectedUser) return 

            const currentMessages = get().messages;
            set({messages: [...currentMessages, newMessage]})

            if (isSoundEnabled){
                const notificationSound = new Audio("/sounds/notification.mp3")
                notificationSound.currentTime = 0; // reset to start
                notificationSound.play().catch((e: any) => console.log("Audio play failed", e)) 
            }
        });
    },

    unSubscribeFromMessage: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage");
    }
}));