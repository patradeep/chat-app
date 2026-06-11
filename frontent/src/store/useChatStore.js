import { create } from "zustand";
import { axiosInstance } from '../lib/axios';
import toast from "react-hot-toast";
import { useAuthStore } from './useAuthStore';
export const useChatStore = create((set,get) => ({
  chats: [],
  users: [],
  selectUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  unsubscribeSocketEvents: null,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const response = await axiosInstance.get("/message/users");
      if (response.data) {
        set({ users: response.data });
      }
    } catch (error) {
      toast.error(error.message);
    }finally{
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const response = await axiosInstance.get(`/message/${userId}`);
      console.log(response.data);
      
      if (response.data) {
        set({ chats: response.data });
      }
    } catch (error) {
      toast.error(error.message);
    }finally{
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (message) => {
    const {selectUser,chats} = get();
    if(!selectUser){
      return toast.error("Please select a user to chat");
    }
    
    const response = await axiosInstance.post(`/message/send/${selectUser._id}`, message);
    if (response.data) {
      set({ chats: [...chats, response.data] });
      return response.data;
    }
  },

  subscribeToSocketEvents: () => {
    const socket = useAuthStore.getState().socket;

    if (!socket) {
      return () => {};
    }

    const handleNewMessage = (incomingMessage) => {
      const currentSelectUser = useChatStore.getState().selectUser;
      const isActiveConversation = currentSelectUser && (
        currentSelectUser._id === incomingMessage.senderId ||
        currentSelectUser._id === incomingMessage.receiverId
      );

      if (!isActiveConversation) {
        return;
      }

      set((state) => ({
        chats: [...state.chats, incomingMessage],
      }));
    };

    socket.on('new-message', handleNewMessage);

    const cleanup = () => {
      socket.off('new-message', handleNewMessage);
    };

    set({ unsubscribeSocketEvents: cleanup });
    return cleanup;
  },

  setSelectUser: (user) => {
    set({ selectUser: user });
  },

}))