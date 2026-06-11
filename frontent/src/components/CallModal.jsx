import React, { useEffect, useRef } from 'react';
import { PhoneOff, PhoneIncoming, Video } from 'lucide-react';
import { useCallStore } from '../store/useCallStore';

function CallModal() {
  const {
    callStatus,
    incomingCall,
    activeCall,
    localStream,
    remoteStream,
    subscribeToCallEvents,
    acceptIncomingCall,
    rejectIncomingCall,
    endCall,
  } = useCallStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const cleanup = subscribeToCallEvents();
    return () => cleanup?.();
  }, [subscribeToCallEvents]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (callStatus === 'idle' && !incomingCall) {
    return null;
  }

  const isIncoming = Boolean(incomingCall);
  const partnerName = activeCall?.partner?.fullname || incomingCall?.fromUser?.fullname || 'Call';
  const handleClose = () => {
    if (isIncoming) {
      rejectIncomingCall();
      return;
    }

    endCall();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-base-100 rounded-3xl shadow-2xl overflow-hidden border border-base-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-300">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-primary">Video call</p>
            <h2 className="text-xl font-semibold">{partnerName}</h2>
            <p className="text-sm text-base-content/60">
              {callStatus === 'calling' && 'Calling...'}
              {callStatus === 'connected' && 'Connected'}
              {isIncoming && 'Incoming call'}
            </p>
          </div>
          <button className="btn btn-ghost btn-circle" onClick={handleClose}>
            <PhoneOff size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:p-6 bg-base-200">
          <div className="relative rounded-3xl overflow-hidden bg-neutral min-h-[260px] md:min-h-[420px]">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-content gap-3">
                <Video size={40} />
                <p className="text-sm">
                  {isIncoming ? 'Waiting for you to answer' : 'Waiting for the other person'}
                </p>
              </div>
            )}
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-base-300 min-h-[220px] md:min-h-[420px] border border-base-300">
            {localStream ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-base-content/60">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            )}
            <div className="absolute bottom-4 left-4 rounded-full bg-black/50 text-white px-3 py-1 text-xs">
              You
            </div>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end border-t border-base-300">
          {isIncoming ? (
            <>
              <button className="btn btn-error" onClick={rejectIncomingCall}>
                <PhoneOff size={18} />
                Decline
              </button>
              <button className="btn btn-primary" onClick={acceptIncomingCall}>
                <PhoneIncoming size={18} />
                Accept
              </button>
            </>
          ) : (
            <button className="btn btn-error" onClick={endCall}>
              <PhoneOff size={18} />
              End call
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CallModal;