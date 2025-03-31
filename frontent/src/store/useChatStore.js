import { create } from "zustand";
import { axiosInstance } from '../lib/axios';
import toast from "react-hot-toast";
export const useChatStore = create((set,get) => ({
  chats: [],
  users: [],
  selectUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

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
    try {
      const {selectUser,chats} = get();
      if(!selectUser){
        return toast.error("Please select a user to chat");
      }
      
      const response = await axiosInstance.post(`/message/send/${selectUser._id}`, message);
      if (response.data) {
        set({ chats: [...chats, response.data] });
        
      }
    }catch (error) {
      toast.error(error.message);
    }
  },

  setSelectUser: (user) => {
    set({ selectUser: user });
  },

}))