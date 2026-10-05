import React, { useRef, useState, useEffect } from "react";
import { useWebRTC } from "../../hooks/useWebRTC";
import {
  Video,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  User,
  X,
  Check,
  Maximize2,
  Minimize2,
  VideoOff,
} from "lucide-react";

const STATUS = {
  connected: { text: "Connected", color: "connected" },
  connecting: { text: "Connecting", color: "connecting" },
  "waiting-for-answer": { text: "Ringing", color: "connecting" },
  "waiting-for-offer": { text: "Waiting", color: "idle" },
  disconnected: { text: "Ready", color: "idle" },
  failed: { text: "Call failed", color: "failed" },
};

const VideoChat = ({
  onCallEnd,
  roomId = "demo-room",
  autoCallMode = null,
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const {
    isCallActive,
    isAudioEnabled,
    isVideoEnabled,
    connectionState,
    connectionError,
    isRinging,
    incomingCall,
    remoteStream,
    signalingServer,
    startCall,
    joinCall,
    endCall,
    acceptCall,
    rejectCall,
    toggleAudio,
    toggleVideo,
  } = useWebRTC({
    localVideoRef,
    remoteVideoRef,
    roomId,
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);
  const autoCallStartedRef = useRef(false);

  useEffect(() => {
    if (!autoCallMode || !signalingServer || autoCallStartedRef.current) {
      return;
    }

    autoCallStartedRef.current = true;
    if (autoCallMode === "caller") {
      startCall();
    } else {
      joinCall();
    }
  }, [autoCallMode, joinCall, signalingServer, startCall]);

  useEffect(() => {
    // Auto-hide controls in fullscreen mode after 3 seconds
    if (isFullscreen && isCallActive) {
      // Initially hide controls after 3 seconds
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);

      // Show controls on any user interaction
      const handleInteraction = () => {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        setShowControls(true);

        // Re-hide after 3 seconds of inactivity
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      };

      // Add event listeners for user interactions
      document.addEventListener("click", handleInteraction);
      document.addEventListener("touchstart", handleInteraction);
      document.addEventListener("mousemove", handleInteraction);

      return () => {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        document.removeEventListener("click", handleInteraction);
        document.removeEventListener("touchstart", handleInteraction);
        document.removeEventListener("mousemove", handleInteraction);
      };
    } else {
      // Always show controls when not in fullscreen or no active call
      setShowControls(true);
    }
  }, [isFullscreen, isCallActive]);

  // Reset UI state when call ends
  useEffect(() => {
    if (!isCallActive) {
      // Reset local UI state
      setIsFullscreen(false);
      setShowControls(true);
    }
  }, [isCallActive]);

  const status = STATUS[connectionState] ?? {
    text: connectionState,
    color: "idle",
  };

  const handleEndCall = () => {
    endCall();
    onCallEnd?.();
  };

  const handleRejectCall = () => {
    rejectCall();
    onCallEnd?.();
  };

  return (
    <div
      className={`relative mx-auto w-full max-w-5xl overflow-auto rounded-2xl border border-slate-700/70 bg-slate-900/95 p-3 shadow-2xl sm:p-5 ${
        isFullscreen && isCallActive
          ? "fixed inset-0 z-40 h-dvh max-h-none w-screen max-w-none overflow-hidden rounded-none border-0 bg-slate-950 p-0"
          : ""
      }`}
    >
      <div
        className={`flex justify-end pb-2.5 ${isFullscreen && isCallActive ? "hidden" : ""}`}
      >
        <span
          className="inline-flex items-center gap-2 rounded-full border border-slate-500/20 bg-slate-800 px-3 py-2 text-xs leading-none text-slate-300"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isRinging || status.color === "connecting"
                ? "animate-pulse bg-amber-400"
                : status.color === "connected"
                  ? "bg-emerald-400"
                  : status.color === "failed"
                    ? "bg-rose-400"
                    : "bg-slate-400"
            }`}
            aria-hidden="true"
          />
          {isRinging ? "Incoming call" : status.text}
        </span>
      </div>

      {connectionError && !isFullscreen && (
        <p
          className="mb-3 rounded-xl border border-rose-400/25 bg-rose-950/50 px-4 py-3 text-sm text-rose-200"
          role="alert"
        >
          {connectionError}
        </p>
      )}

      {/* Incoming Call Modal */}
      {isRinging && incomingCall && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center shadow-2xl sm:p-8">
            <Phone className="mx-auto mb-4 h-14 w-14 animate-pulse text-sky-400 sm:h-16 sm:w-16" />
            <h3 className="text-xl font-bold text-slate-100 mb-2">
              Incoming Call
            </h3>
            <p className="mb-6 text-sm text-slate-400">Join the video call</p>

            <div className="flex justify-center gap-3">
              <button
                onClick={acceptCall}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-medium text-white transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                <Check className="w-4 h-4" />
                <span className="btn-text">Accept</span>
              </button>
              <button
                onClick={handleRejectCall}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-rose-700 px-5 py-3 font-medium text-white transition hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                <X className="w-4 h-4" />
                <span className="btn-text">Reject</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Video Grid */}
      <div
        className={`relative mb-3 gap-3 md:mb-4 md:gap-4 ${
          isFullscreen && isCallActive
          ? "fixed inset-0 z-0 block h-dvh w-screen"
          : "grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)]"
        }`}
      >
        {/* Remote Video */}
        <div
          className={`relative overflow-hidden bg-slate-950 shadow-xl ${
            isFullscreen && isCallActive
              ? "fixed inset-0 z-0 h-dvh w-screen rounded-none"
              : "h-[min(48dvh,420px)] min-h-[230px] rounded-2xl md:h-[clamp(320px,52vh,560px)]"
          }`}
        >
          <div className="absolute left-3 top-3 z-10">
            <span className="flex items-center gap-1.5 rounded-full bg-slate-950/75 px-3 py-1.5 text-xs font-medium text-slate-200 backdrop-blur-sm">
              <User className="w-3 h-3" />
              Guest
            </span>
          </div>

          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted={false}
            className={`block h-full w-full bg-black object-cover ${
              isFullscreen && isCallActive
                ? "h-dvh w-screen rounded-none"
                : "rounded-2xl"
            }`}
          />

          {!remoteStream && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800/70 to-slate-950/90">
              <div className="max-w-60 px-4 text-center">
                <Video className="mx-auto mb-4 h-14 w-14 text-slate-500 sm:h-16 sm:w-16" />
                <h4 className="mb-1 font-medium text-slate-300">
                  Waiting for connection
                </h4>
                <p className="text-sm text-slate-500">
                  Invite someone to start a call
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Local Video */}
        <div className={`relative overflow-hidden rounded-2xl bg-slate-950 shadow-xl ${
          isFullscreen && isCallActive
            ? "absolute bottom-6 right-6 z-20 h-[clamp(100px,15vw,190px)] w-[clamp(140px,20vw,260px)] border border-white/25"
            : "h-[clamp(200px,34vh,380px)] max-md:absolute max-md:bottom-2 max-md:right-2 max-md:z-20 max-md:h-[clamp(136px,38vw,196px)] max-md:w-[clamp(104px,30vw,156px)] max-md:border max-md:border-white/25 max-md:shadow-2xl md:w-full"
        }`}>
          <div className="absolute left-3 top-3 z-10">
            <span className="flex items-center gap-1.5 rounded-full bg-slate-950/75 px-3 py-1.5 text-xs font-medium text-slate-200 backdrop-blur-sm">
              <User className="w-3 h-3" />
              You
            </span>
          </div>

          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="block h-full w-full rounded-2xl bg-black object-cover"
          />
        </div>
      </div>

      {/* Active Call Controls */}
      {isCallActive && (
        <div
          className={`flex items-center justify-center gap-2 transition-opacity duration-300 sm:gap-3 ${
            isFullscreen
              ? "fixed bottom-6 left-1/2 z-[100] w-max -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/85 p-2 shadow-2xl backdrop-blur-xl"
              : "relative mb-2"
          } ${
            isFullscreen && !showControls
              ? "pointer-events-none opacity-0"
              : "pointer-events-auto opacity-100"
          }`}
        >
          {/* End Call */}
          <button
            type="button"
            onClick={handleEndCall}
            aria-label="End call"
            title="End call"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-700 text-white shadow-lg transition hover:scale-105 hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            <PhoneOff className="w-5 h-5 text-white shrink-0" />
          </button>

          {/* Microphone */}
          <button
            type="button"
            onClick={toggleAudio}
            aria-label={
              isAudioEnabled ? "Mute microphone" : "Unmute microphone"
            }
            title={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
            className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              isAudioEnabled
                ? "bg-emerald-700 hover:bg-emerald-600"
                : "bg-slate-600 hover:bg-slate-500"
            }`}
          >
            {isAudioEnabled ? (
              <Mic className="w-5 h-5 text-white shrink-0" />
            ) : (
              <MicOff className="w-5 h-5 text-white shrink-0" />
            )}
          </button>

          {/* Camera */}
          <button
            type="button"
            onClick={toggleVideo}
            aria-label={isVideoEnabled ? "Turn camera off" : "Turn camera on"}
            title={isVideoEnabled ? "Turn camera off" : "Turn camera on"}
            className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              isVideoEnabled
                ? "bg-emerald-700 hover:bg-emerald-600"
                : "bg-slate-600 hover:bg-slate-500"
            }`}
          >
            {isVideoEnabled ? (
              <Video className="w-5 h-5 text-white shrink-0" />
            ) : (
              <VideoOff className="w-5 h-5 text-white shrink-0" />
            )}
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={() => {
              setIsFullscreen((current) => !current);
              setShowControls(true);
            }}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700 text-white shadow-lg transition hover:scale-105 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 text-white shrink-0" />
            ) : (
              <Maximize2 className="w-5 h-5 text-white shrink-0" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoChat;
