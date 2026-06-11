import { create } from 'zustand';
import toast from 'react-hot-toast';
import { useAuthStore } from './useAuthStore';
import { useChatStore } from './useChatStore';

const DEFAULT_ICE_SERVERS = [
  {
    urls: 'stun:stun.l.google.com:19302',
  },
];

const buildIceServers = () => {
  const servers = [...DEFAULT_ICE_SERVERS];
  const turnUrl = import.meta.env.VITE_TURN_URL;

  if (turnUrl) {
    const turnServer = {
      urls: turnUrl,
    };

    if (import.meta.env.VITE_TURN_USERNAME) {
      turnServer.username = import.meta.env.VITE_TURN_USERNAME;
    }

    if (import.meta.env.VITE_TURN_CREDENTIAL) {
      turnServer.credential = import.meta.env.VITE_TURN_CREDENTIAL;
    }

    servers.push(turnServer);
  }

  return servers;
};

let subscriptionCleanup = null;

export const useCallStore = create((set, get) => ({
  callStatus: 'idle',
  incomingCall: null,
  activeCall: null,
  localStream: null,
  remoteStream: null,
  peerConnection: null,

  subscribeToCallEvents: () => {
    const socket = useAuthStore.getState().socket;

    if (!socket) {
      return () => {};
    }

    if (subscriptionCleanup) {
      subscriptionCleanup();
      subscriptionCleanup = null;
    }

    const handleIncomingOffer = async (payload) => {
      const currentCall = get().callStatus;

      if (currentCall !== 'idle' && currentCall !== 'incoming') {
        socket.emit('call:reject', {
          targetUserId: payload.fromUserId,
          reason: 'busy',
        });
        return;
      }

      set({
        callStatus: 'incoming',
        incomingCall: payload,
        activeCall: {
          partnerId: payload.fromUserId,
          partner: payload.fromUser,
          direction: 'incoming',
        },
      });
    };

    const handleCallAnswer = async (payload) => {
      const peerConnection = get().peerConnection;
      if (!peerConnection) {
        return;
      }

      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.answer));
        set({ callStatus: 'connected' });
      } catch (error) {
        toast.error('Failed to connect the call');
      }
    };

    const handleIceCandidate = async (payload) => {
      const peerConnection = get().peerConnection;
      if (!peerConnection || !payload?.candidate) {
        return;
      }

      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    };

    const handleCallReject = (payload) => {
      const reason = payload?.reason === 'busy' ? 'User is busy' : 'Call declined';
      toast.error(reason);
      get().cleanupCall();
    };

    const handleCallEnd = () => {
      get().cleanupCall();
    };

    socket.on('call:offer', handleIncomingOffer);
    socket.on('call:answer', handleCallAnswer);
    socket.on('call:iceCandidate', handleIceCandidate);
    socket.on('call:reject', handleCallReject);
    socket.on('call:end', handleCallEnd);

    subscriptionCleanup = () => {
      socket.off('call:offer', handleIncomingOffer);
      socket.off('call:answer', handleCallAnswer);
      socket.off('call:iceCandidate', handleIceCandidate);
      socket.off('call:reject', handleCallReject);
      socket.off('call:end', handleCallEnd);
    };

    return subscriptionCleanup;
  },

  cleanupCall: () => {
    const { localStream, peerConnection } = get();

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    if (peerConnection) {
      peerConnection.ontrack = null;
      peerConnection.onicecandidate = null;
      peerConnection.close();
    }

    set({
      callStatus: 'idle',
      incomingCall: null,
      activeCall: null,
      localStream: null,
      remoteStream: null,
      peerConnection: null,
    });
  },

  createPeerConnection: (targetUserId) => {
    const socket = useAuthStore.getState().socket;
    const peerConnection = new RTCPeerConnection({
      iceServers: buildIceServers(),
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('call:iceCandidate', {
          targetUserId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        set({ remoteStream });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      const connectionState = peerConnection.connectionState;

      if (['failed', 'disconnected', 'closed'].includes(connectionState)) {
        get().cleanupCall();
      }
    };

    set({ peerConnection });
    return peerConnection;
  },

  startOutgoingCall: async () => {
    const socket = useAuthStore.getState().socket;
    const selectUser = useChatStore.getState().selectUser;

    if (!socket) {
      toast.error('Realtime connection is not ready');
      return;
    }

    if (!selectUser?._id) {
      toast.error('Please select a user first');
      return;
    }

    if (get().callStatus !== 'idle') {
      toast.error('Finish the current call first');
      return;
    }

    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const peerConnection = get().createPeerConnection(selectUser._id);
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      set({
        callStatus: 'calling',
        activeCall: {
          partnerId: selectUser._id,
          partner: selectUser,
          direction: 'outgoing',
        },
        localStream,
      });

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socket.emit('call:offer', {
        targetUserId: selectUser._id,
        offer,
      });
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Could not start the call');
      get().cleanupCall();
    }
  },

  acceptIncomingCall: async () => {
    const socket = useAuthStore.getState().socket;
    const incomingCall = get().incomingCall;

    if (!socket || !incomingCall) {
      return;
    }

    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const peerConnection = get().createPeerConnection(incomingCall.fromUserId);
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      await peerConnection.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      set({
        callStatus: 'connected',
        activeCall: {
          partnerId: incomingCall.fromUserId,
          partner: incomingCall.fromUser,
          direction: 'incoming',
        },
        incomingCall: null,
        localStream,
      });

      socket.emit('call:answer', {
        targetUserId: incomingCall.fromUserId,
        answer,
      });
    } catch (error) {
      console.error('Error accepting call:', error);
      toast.error('Could not accept the call');
      get().cleanupCall();
    }
  },

  rejectIncomingCall: () => {
    const socket = useAuthStore.getState().socket;
    const incomingCall = get().incomingCall;

    if (socket && incomingCall) {
      socket.emit('call:reject', {
        targetUserId: incomingCall.fromUserId,
        reason: 'declined',
      });
    }

    get().cleanupCall();
  },

  endCall: () => {
    const socket = useAuthStore.getState().socket;
    const activeCall = get().activeCall;

    if (socket && activeCall?.partnerId) {
      socket.emit('call:end', {
        targetUserId: activeCall.partnerId,
      });
    }

    get().cleanupCall();
  },
}));