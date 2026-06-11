import {create} from 'zustand'
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

let socket = null;

export const useAuthStore = create((set) => ({
  authUser: null,
  isSignup: false,
  isLoggedIn: false,
  isUpdateProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  connectSocket: () => {
    const { authUser, socket: currentSocket } = useAuthStore.getState();

    if (!authUser?.user?._id || currentSocket) {
      return currentSocket;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL;
    socket = io(socketUrl, {
      withCredentials: true,
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    socket.on('online-users', (onlineUsers) => {
      useAuthStore.setState({ onlineUsers });
    });

    socket.on('disconnect', () => {
      useAuthStore.setState({ socket: null });
    });

    useAuthStore.setState({ socket });
    return socket;
  },

  disconnectSocket: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }

    set({ socket: null, onlineUsers: [] });
  },

  checkAuth: async()=>{
    try {
        const response = await axiosInstance.get('/auth/check');
        if(response.data){
            set({authUser: response.data})
        }
    } catch (error) {
        console.log("Error in checking auth: ", error);
        set({authUser: null})
    }finally{
        set({isCheckingAuth: false})
    }
  },

  signup1: async(data) => {
    set({isSignup: true})
    try {
        const response = await axiosInstance.post('/auth/signup', data);
        if(response.data){
            set({authUser: response.data})
            toast.success("User created successfully")
        }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Signup failed')
        set({authUser: null})
    }finally{
        set({isSignup: false})
    }
  },

  login1: async(data) => {
    set({isLoggedIn: true})
    try {
        const response = await axiosInstance.post('/auth/login', data);
        if(response.data){
            set({authUser: response.data})
            toast.success("User logged in successfully")
        }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Login failed')
        set({authUser: null})
    }finally{
        set({isLoggedIn: false})
    }
  },

  logout1: async() => {
    try {
        const response = await axiosInstance.post('/auth/logout');
        if(response.data){
            set({authUser: null})
        useAuthStore.getState().disconnectSocket();
            toast.success("User logged out successfully")
        }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Logout failed')
        set({authUser: null})
    }
  },

  updateProfile1: async (formData) => {
    set({ isUpdateProfile: true });
    try {
      const response = await axiosInstance.put('/auth/update-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data) {
        set({ authUser: response.data });
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Profile update failed');
    } finally {
      set({ isUpdateProfile: false });
    }
  }
}))