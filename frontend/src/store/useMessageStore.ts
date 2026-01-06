import { create } from "zustand";
import { axiosInstance } from "../libs/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";


export interface User {
  _id: string;
  fullName?: string;
  email?: string;
  profilePic?: string;
  username?: string;
  bio?: string;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  attachments?: {
    type: "image" | "file";
    url: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface MessageStore{
    allContacts: User[],
    chats: User[],
    messages: Message[],
    activeTab: string,
    selectedUser: User | null,
    deletedUserIds: string[],
    isSelectedUserDeleted: boolean,
    blockedUserIds: string[],
    blockedByUserIds: string[],
    isSelectedUserBlocked: boolean,
    isSelectedUserBlockingMe: boolean,
    blockedUsers: {
        userId: string;
        displayName: string;
        username?: string;
        avatarUrl?: string;
        blockedAt?: string;
    }[],
    isBlockedUsersLoading: boolean,
    isUsersLoading: boolean,
    isMessagesLoading: boolean,
    isSoundEnabled: boolean,

    // functions
    toggleSound: () => void,
    setActiveTab: (tab: string) => void,
    setSelectedUser: (user: User | null) => void,
    handleUserDeleted: (userId: string) => void,
    fetchBlockedUsers: () => Promise<void>,
    fetchBlockedUsersDetailed: () => Promise<void>,
    blockUser: (userId: string) => Promise<void>,
    unblockUser: (userId: string) => Promise<void>,
    handleUserBlocked: (userId: string) => void,
    handleUserUnblocked: (userId: string) => void,
    hideChat: (userId: string) => Promise<void>,
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
    deletedUserIds: [],
    isSelectedUserDeleted: false,
    blockedUserIds: [],
    blockedByUserIds: [],
    isSelectedUserBlocked: false,
    isSelectedUserBlockingMe: false,
    blockedUsers: [],
    isBlockedUsersLoading: false,
    isUsersLoading: false,
    isMessagesLoading: false,
    isSoundEnabled: localStorage.getItem("isSoundEnabled") === "true",

    toggleSound: () => {
        localStorage.setItem("isSoundEnabled", String(!get().isSoundEnabled));
        set({isSoundEnabled: !get().isSoundEnabled})
    },

    setActiveTab: (tab) => set({activeTab: tab}),
    setSelectedUser: (selectedUser) => {
        const { blockedUserIds, blockedByUserIds } = get();
        const isSelectedUserBlocked = selectedUser ? blockedUserIds.includes(selectedUser._id) : false;
        const isSelectedUserBlockingMe = selectedUser ? blockedByUserIds.includes(selectedUser._id) : false;
        set({
            selectedUser,
            isSelectedUserDeleted: false,
            isSelectedUserBlocked,
            isSelectedUserBlockingMe
        });
    },
    handleUserDeleted: (userId) => {
        const { selectedUser, deletedUserIds, allContacts, chats } = get();
        const nextDeletedIds = deletedUserIds.includes(userId)
            ? deletedUserIds
            : deletedUserIds.concat(userId);
        const isSelectedUserDeleted = selectedUser?._id === userId;

        set({
            deletedUserIds: nextDeletedIds,
            isSelectedUserDeleted,
            allContacts: allContacts.filter((user) => user._id !== userId),
            chats: chats.filter((user) => user._id !== userId),
            isSelectedUserBlocked: isSelectedUserDeleted ? false : get().isSelectedUserBlocked,
            isSelectedUserBlockingMe: isSelectedUserDeleted ? false : get().isSelectedUserBlockingMe
        });
    },
    fetchBlockedUsers: async () => {
        try {
            const res = await axiosInstance.get("/users/blocked/list");
            if (res.data.success && res.data.data) {
                set({
                    blockedUserIds: res.data.data.blockedIds || [],
                    blockedByUserIds: res.data.data.blockedByIds || []
                });
                const { selectedUser } = get();
                if (selectedUser) {
                    set({
                        isSelectedUserBlocked: res.data.data.blockedIds?.includes(selectedUser._id) ?? false,
                        isSelectedUserBlockingMe: res.data.data.blockedByIds?.includes(selectedUser._id) ?? false
                    });
                }
            }
        } catch (error: any) {
            const message =
                error?.response?.data?.message ?? error?.message ?? "Failed to fetch blocked users";
            toast.error(message);
        }
    },
    fetchBlockedUsersDetailed: async () => {
        set({ isBlockedUsersLoading: true });
        try {
            const res = await axiosInstance.get("/me/blocked");
            if (res.data.success && res.data.data) {
                set({ blockedUsers: res.data.data.blocked || [] });
            }
        } catch (error: any) {
            const message =
                error?.response?.data?.message ?? error?.message ?? "Failed to fetch blocked users";
            toast.error(message);
        } finally {
            set({ isBlockedUsersLoading: false });
        }
    },
    blockUser: async (userId) => {
        try {
            const res = await axiosInstance.post(`/users/${userId}/block`);
            if (res.data.success) {
                const { blockedUserIds, selectedUser } = get();
                const updated = blockedUserIds.includes(userId)
                    ? blockedUserIds
                    : blockedUserIds.concat(userId);
                set({
                    blockedUserIds: updated,
                    isSelectedUserBlocked: selectedUser?._id === userId,
                    isSelectedUserBlockingMe: selectedUser?._id === userId ? false : get().isSelectedUserBlockingMe
                });
                toast.success("User blocked");
            }
        } catch (error: any) {
            const message =
                error?.response?.data?.message ?? error?.message ?? "Failed to block user";
            toast.error(message);
        }
    },
    unblockUser: async (userId) => {
        try {
            const res = await axiosInstance.delete(`/users/${userId}/block`);
            if (res.data.success) {
                const { blockedUserIds, selectedUser } = get();
                const updated = blockedUserIds.filter((id) => id !== userId);
                set({
                    blockedUserIds: updated,
                    isSelectedUserBlocked: selectedUser?._id === userId ? false : get().isSelectedUserBlocked,
                    isSelectedUserBlockingMe: selectedUser?._id === userId ? false : get().isSelectedUserBlockingMe,
                    blockedUsers: get().blockedUsers.filter((user) => user.userId !== userId)
                });
                toast.success("User unblocked");
            }
        } catch (error: any) {
            const message =
                error?.response?.data?.message ?? error?.message ?? "Failed to unblock user";
            toast.error(message);
        }
    },
    handleUserBlocked: (userId) => {
        const { blockedByUserIds, selectedUser } = get();
        const updated = blockedByUserIds.includes(userId)
            ? blockedByUserIds
            : blockedByUserIds.concat(userId);
        set({
            blockedByUserIds: updated,
            isSelectedUserBlockingMe: selectedUser?._id === userId
        });
    },
    handleUserUnblocked: (userId) => {
        const { blockedByUserIds, selectedUser } = get();
        const updated = blockedByUserIds.filter((id) => id !== userId);
        set({
            blockedByUserIds: updated,
            isSelectedUserBlockingMe: selectedUser?._id === userId ? false : get().isSelectedUserBlockingMe
        });
    },
    hideChat: async (userId) => {
        try {
            const res = await axiosInstance.post(`/message/hide/${userId}`);
            if (res.data.success) {
                const { chats, selectedUser } = get();
                set({
                    chats: chats.filter((user) => user._id !== userId),
                    selectedUser: selectedUser?._id === userId ? null : selectedUser,
                    isSelectedUserDeleted: selectedUser?._id === userId ? false : get().isSelectedUserDeleted,
                    isSelectedUserBlocked: selectedUser?._id === userId ? false : get().isSelectedUserBlocked,
                    isSelectedUserBlockingMe: selectedUser?._id === userId ? false : get().isSelectedUserBlockingMe
                });
                toast.success("Chat removed");
            }
        } catch (error: any) {
            const message =
                error?.response?.data?.message ?? error?.message ?? "Failed to remove chat";
            toast.error(message);
        }
    },

    getAllContacts: async () => {
        set({isUsersLoading: true});
        try{
            const res = await axiosInstance.get("/message/getcontacts");
            if (res.data.success && res.data.data){
                const { deletedUserIds } = get();
                const filtered = deletedUserIds.length
                    ? res.data.data.filter((user: User) => !deletedUserIds.includes(user._id))
                    : res.data.data;
                set({allContacts: filtered})
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
                const { deletedUserIds } = get();
                const filtered = deletedUserIds.length
                    ? res.data.data.filter((user: User) => !deletedUserIds.includes(user._id))
                    : res.data.data;
                set({chats: filtered})
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
        const {selectedUser, messages, deletedUserIds, blockedUserIds, blockedByUserIds} = get()
        const {authUser} = useAuthStore.getState()
        if (!selectedUser?._id || deletedUserIds.includes(selectedUser._id)) {
            toast.error("This user no longer exists.");
            return;
        }
        if (blockedUserIds.includes(selectedUser._id) || blockedByUserIds.includes(selectedUser._id)) {
            toast.error("You cannot message this user.");
            return;
        }

        const tempId = `temp-${Date.now()}`
        const message = messageData.get("text")
        const files = messageData.getAll("attachments") as File[];
        const attachments = files.map((file) => ({
            type: (file.type.startsWith("image/") ? "image" : "file") as "image" | "file",
            url: URL.createObjectURL(file),
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type
        }));
        const firstImage = attachments.find((attachment) => attachment.type === "image");

        const optimisticMessage:Message = {
            _id: tempId,
            senderId: authUser?._id!,
            receiverId: selectedUser?._id!,
            text:message && typeof message === "string" ? message : undefined,
            image: firstImage?.url,
            attachments,
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
            error?.response?.data?.error?.message ?? error?.response?.data?.message ?? error?.message ?? "Sending Messages Failed";
            toast.error(message);
        }
    },

    subscribeToMessage: () => {
        const {selectedUser, isSoundEnabled} = get()
        if (!selectedUser) return

        const socket = useAuthStore.getState().socket;

        socket?.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id
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
