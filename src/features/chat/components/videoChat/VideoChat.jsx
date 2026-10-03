import React, { useRef, useState, useEffect } from "react";
import { useWebRTC } from "../../hooks/useWebRTC";
import {
  Video,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  User,
  Wifi,
  Loader2,
  Circle,
  HelpCircle,
  X,
  Check,
  Clock,
  AlertCircle,
  Radio,
  RadioTower,
  Maximize2,
  Minimize2,
  VideoOff,
} from "lucide-react";

const STATUS = {
  connected: {
    icon: <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />,
    text: "Connected",
    color: "text-emerald-500",
    dotColor: "bg-emerald-500",
  },
  connecting: {
    icon: <Loader2 className="w-3 h-3 animate-spin text-amber-500" />,
    text: "Connecting...",
    color: "text-amber-500",
    dotColor: "bg-amber-500",
  },
  "waiting-for-answer": {
    icon: <Loader2 className="w-3 h-3 animate-spin text-amber-500" />,
    text: "Ringing...",
    color: "text-amber-500",
    dotColor: "bg-amber-500",
  },
  "waiting-for-offer": {
    icon: <Clock className="w-3 h-3 text-slate-400" />,
    text: "Waiting for call",
    color: "text-slate-400",
    dotColor: "bg-slate-400",
  },
  disconnected: {
    icon: <Circle className="w-2 h-2 fill-slate-500 text-slate-500" />,
    text: "Ready",
    color: "text-slate-400",
    dotColor: "bg-slate-500",
  },
  failed: {
    icon: <AlertCircle className="w-3 h-3 text-red-500" />,
    text: "Connection failed",
    color: "text-red-500",
    dotColor: "bg-red-500",
  },
};

const VideoChat = ({ onCallEnd }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const {
    isCallActive,
    isAudioEnabled,
    isVideoEnabled,
    isConnecting,
    connectionState,
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
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

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
    icon: <Circle className="w-2 h-2 fill-slate-500 text-slate-500" />,
    text: connectionState,
    color: "text-slate-400",
    dotColor: "bg-slate-500",
  };

  // Ringing status override
  const ringingStatus = {
    icon: <Phone className="w-4 h-4 text-amber-500 animate-pulse" />,
    text: incomingCall
      ? `Incoming call from ${incomingCall.from}`
      : "Incoming call",
    color: "text-amber-500",
    dotColor: "bg-amber-500",
  };

  const displayStatus = isRinging ? ringingStatus : status;

  return (
    <div
      className={`video-chat-container backdrop-blur-md bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:shadow-slate-900/50 ${
        isFullscreen && isCallActive
          ? "fixed inset-0 w-screen h-screen rounded-none z-40 border-0 backdrop-blur-none bg-slate-950/90"
          : ""
      }`}
    >
      {/* Header */}
      <div className="video-chat-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div
          className={`header-left ${isFullscreen && isCallActive ? "hidden" : ""}`}
        >
          <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Video className="w-6 h-6 text-blue-500" />
            Video Call
          </h3>
          <div className="subtitle text-sm text-slate-400">
            {isCallActive ? "In call" : "Ready to connect"}
          </div>
        </div>

        <div className="connection-status flex items-center gap-3 bg-slate-800/50 rounded-lg px-4 py-2">
          <div className={`w-2 h-2 rounded-full ${displayStatus.dotColor}`} />
          <span
            className={`status-text text-sm font-medium ${displayStatus.color}`}
          >
            {displayStatus.text}
          </span>
          <span className="signal-type text-xs text-slate-500 flex items-center gap-1">
            {signalingServer?.getConnectionType?.() === "websocket" ? (
              <RadioTower className="w-3 h-3" />
            ) : (
              <Radio className="w-3 h-3" />
            )}
            <span>
              {signalingServer?.getConnectionType?.() || "checking..."}
            </span>
          </span>
        </div>
      </div>

      {/* Incoming Call Modal */}
      {isRinging && incomingCall && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="call-modal bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center shadow-2xl">
            <Phone className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-pulse" />
            <h3 className="text-xl font-bold text-slate-100 mb-2">
              Incoming Call
            </h3>
            <p className="text-slate-400 mb-6">Join the video call</p>

            <div className="ringing-actions flex gap-3 justify-center">
              <button
                onClick={acceptCall}
                className="action-btn success bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span className="btn-text">Accept</span>
              </button>
              <button
                onClick={rejectCall}
                className="action-btn danger bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2"
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
        className={`video-grid grid gap-4 mb-6 ${
          isFullscreen && isCallActive
            ? "grid-cols-1 fixed inset-0 z-0 w-screen h-screen gap-0 mb-0 p-0"
            : "grid-cols-1 lg:grid-cols-2"
        }`}
      >
        {/* Remote Video */}
        <div
          className={`video-container remote-video relative ${
            isFullscreen && isCallActive ? "h-full w-full p-0" : ""
          }`}
        >
          <div className="video-label absolute top-3 left-3 z-10">
            <span className="user-badge bg-slate-900/80 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1">
              <User className="w-3 h-3" />
              Guest
            </span>
          </div>

          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted={false}
            className={`video-element w-full h-full object-cover ${
              isFullscreen && isCallActive
                ? "w-screen h-screen rounded-none"
                : "rounded-xl"
            }`}
          />

          {!remoteStream && (
            <div className="video-placeholder absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800/50 to-slate-900/70">
              <div className="placeholder-content text-center">
                <Video className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                <h4 className="text-slate-300 font-medium mb-1">
                  Waiting for connection
                </h4>
                <p className="text-slate-500 text-sm">
                  Invite someone to start a call
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Local Video */}
        <div className="video-container local-video relative">
          <div className="video-label absolute top-3 left-3 z-10">
            <span className="user-badge bg-slate-900/80 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1">
              <User className="w-3 h-3" />
              You
            </span>
          </div>

          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="video-element w-full h-full object-cover rounded-xl"
          />
        </div>
      </div>

      {/* Call Controls with Call a Friend and Join Call Buttons */}
      <div
        className={`video-controls bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 ${
          isFullscreen && isCallActive && !showControls
            ? "opacity-0 pointer-events-none transition-opacity duration-300"
            : ""
        }`}
      >
        <div className="flex flex-col gap-4">
          {/* Init Buttons - Call a Friend and Join Call */}
          {!isCallActive && (
            <div className="call-init-buttons flex gap-3 justify-center">
              <button
                onClick={startCall}
                disabled={isConnecting}
                className="action-btn primary bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 min-w-[160px]"
              >
                <Phone className="w-4 h-4" />
                <span className="btn-text">
                  {isConnecting ? "Calling..." : "Call a Friend"}
                </span>
                {isConnecting && <Loader2 className="w-4 h-4 animate-spin" />}
              </button>

              <button
                onClick={joinCall}
                disabled={isConnecting}
                className="action-btn secondary bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 min-w-[160px]"
              >
                <Phone className="w-4 h-4" />
                <span className="btn-text">Join Call</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Call Controls */}
      {isCallActive && (
        <div
          className={`
      active-call-controls
      flex items-center justify-center gap-3
      ${
        isFullscreen
          ? `
            fixed
            bottom-6
            left-1/2
            -translate-x-1/2
            z-[100]
            w-auto
            px-4
            py-3
            rounded-2xl
            bg-slate-950/80
            backdrop-blur-xl
            border border-white/10
            shadow-2xl
          `
          : "relative mb-2"
      }
      ${
        isFullscreen && !showControls
          ? "opacity-0 pointer-events-none"
          : "opacity-100 pointer-events-auto"
      }
      transition-opacity duration-300
    `}
        >
          {/* End Call */}
          <button
            type="button"
            onClick={endCall}
            aria-label="End call"
            title="End call"
            className="
        flex items-center justify-center
        w-12 h-12
        rounded-full
        bg-red-600
        hover:bg-red-700
        active:bg-red-800
        text-white
        shadow-lg
        transition-all
        duration-200
        hover:scale-105
        focus:outline-none
        focus:ring-2
        focus:ring-red-400
        focus:ring-offset-2
        focus:ring-offset-slate-900
      "
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
            className={`
        flex items-center justify-center
        w-12 h-12
        rounded-full
        text-white
        shadow-lg
        transition-all
        duration-200
        hover:scale-105
        focus:outline-none
        focus:ring-2
        focus:ring-white/40
        focus:ring-offset-2
        focus:ring-offset-slate-900
        ${
          isAudioEnabled
            ? "bg-emerald-600 hover:bg-emerald-700"
            : "bg-slate-600 hover:bg-slate-700"
        }
      `}
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
            className={`
        flex items-center justify-center
        w-12 h-12
        rounded-full
        text-white
        shadow-lg
        transition-all
        duration-200
        hover:scale-105
        focus:outline-none
        focus:ring-2
        focus:ring-white/40
        focus:ring-offset-2
        focus:ring-offset-slate-900
        ${
          isVideoEnabled
            ? "bg-emerald-600 hover:bg-emerald-700"
            : "bg-slate-600 hover:bg-slate-700"
        }
      `}
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
            className="
        flex items-center justify-center
        w-12 h-12
        rounded-full
        bg-purple-600
        hover:bg-purple-700
        active:bg-purple-800
        text-white
        shadow-lg
        transition-all
        duration-200
        hover:scale-105
        focus:outline-none
        focus:ring-2
        focus:ring-purple-400
        focus:ring-offset-2
        focus:ring-offset-slate-900
      "
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 text-white shrink-0" />
            ) : (
              <Maximize2 className="w-5 h-5 text-white shrink-0" />
            )}
          </button>
        </div>
      )}

      {/* Connection Details */}
      <div className="call-info mt-4 pt-4 border-t border-slate-700/50">
        <div className="connection-details flex flex-wrap gap-4 justify-center text-sm text-slate-400">
          <span className="detail-item flex items-center gap-2">
            <Wifi className="w-3 h-3 text-slate-500" />
            <strong className="text-slate-300">Status:</strong> {status.text}
          </span>
          <span className="detail-item flex items-center gap-2">
            {isAudioEnabled ? (
              <Mic className="w-3 h-3 text-slate-500" />
            ) : (
              <MicOff className="w-3 h-3 text-slate-500" />
            )}
            <strong className="text-slate-300">Audio:</strong>{" "}
            {isAudioEnabled ? "On" : "Off"}
          </span>
          <span className="detail-item flex items-center gap-2">
            {isVideoEnabled ? (
              <Video className="w-3 h-3 text-slate-500" />
            ) : (
              <Video className="w-3 h-3 text-slate-500 opacity-50" />
            )}
            <strong className="text-slate-300">Video:</strong>{" "}
            {isVideoEnabled ? "On" : "Off"}
          </span>
        </div>

        {/* Help Section */}
        <div className="help-text mt-4">
          <details className="group bg-slate-800/30 rounded-lg p-3 border border-slate-700/30 hover:bg-slate-800/50 transition-colors">
            <summary className="cursor-pointer flex items-center gap-2 text-sm text-blue-400 font-medium">
              <HelpCircle className="w-4 h-4" />
              How to use
            </summary>
            <div className="help-content mt-4 p-4 bg-slate-900/30 rounded-lg border border-slate-700/30">
              <ol className="text-slate-400 space-y-2 text-sm list-decimal list-inside">
                <li>Share this page URL with your friend</li>
                <li>You click "Call a Friend" (Caller)</li>
                <li>Friend clicks "Join Call" (Callee)</li>
                <li>Allow camera/microphone permissions</li>
                <li>Wait for connection (10-15 seconds)</li>
              </ol>
              <p className="tip mt-4 p-3 bg-blue-900/20 rounded-md border-l-4 border-blue-600 text-slate-300 text-sm">
                <strong className="text-blue-400">Tip:</strong> Use Chrome on
                HTTPS for best results
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default VideoChat;
