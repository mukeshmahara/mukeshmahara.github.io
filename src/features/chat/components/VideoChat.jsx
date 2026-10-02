import React, { useRef } from "react";
import { useWebRTC } from "../hooks/useWebRTC";

const STATUS = {
  connected: { icon: "🟢", text: "Connected via WebRTC" },
  connecting: { icon: "🟡", text: "Connecting..." },
  "waiting-for-answer": { icon: "🟡", text: "Waiting for answer..." },
  "waiting-for-offer": { icon: "🟡", text: "Ready to receive call" },
  disconnected: { icon: "⚪️", text: "Ready" },
  failed: { icon: "🔴", text: "Connection failed" },
};

const VideoChat = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const {
    isCallActive,
    isAudioEnabled,
    isVideoEnabled,
    isConnecting,
    connectionState,
    localStream,
    remoteStream,
    signalingServer,
    startCall,
    joinCall,
    endCall,
    toggleAudio,
    toggleVideo,
    simulateIncomingCall,
  } = useWebRTC({
    localVideoRef,
    remoteVideoRef,
  });

  const status = STATUS[connectionState] ?? {
    icon: "⚪️",
    text: connectionState,
  };

  return (
    <div className="video-chat-container project-card">
      <div className="video-chat-header">
        <h3>🎥 WebRTC Video Chat</h3>

        <div className="connection-status">
          <span className={`status-indicator ${connectionState}`}>
            {status.icon}
          </span>
          <span className="status-text">{status.text}</span>
        </div>
      </div>

      <div className="video-grid">
        <div className="video-container remote-video">
          <div className="video-label">
            <span className="user-badge">👤 Remote User</span>
          </div>

          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted={false}
            className="video-element"
          />

          {!remoteStream && (
            <div className="video-placeholder">
              <div className="placeholder-icon">📹</div>
              <p>Waiting for connection...</p>
            </div>
          )}
        </div>

        <div className="video-container local-video">
          <div className="video-label">
            <span className="user-badge">👤 You</span>
          </div>

          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="video-element"
          />

          {!localStream && (
            <div className="video-placeholder">
              <div className="placeholder-icon">📸</div>
              <p>Camera preview</p>
            </div>
          )}
        </div>
      </div>

      <div className="video-controls">
        {!isCallActive ? (
          <div className="call-init-buttons">
            <button
              onClick={startCall}
              disabled={isConnecting}
              className="nav-button btn-primary"
            >
              {isConnecting ? "🔄 Calling..." : "📞 Call a Friend"}
            </button>

            <button
              onClick={joinCall}
              disabled={isConnecting}
              className="nav-button btn-secondary"
            >
              {isConnecting ? "🔄 Joining..." : "📱 Join as Callee"}
            </button>

            <button
              onClick={simulateIncomingCall}
              className="nav-button btn-info"
            >
              🔔 Simulate Incoming Call
            </button>
          </div>
        ) : (
          <div className="active-call-controls">
            <button onClick={endCall} className="nav-button btn-danger">
              📞 End Call
            </button>

            <button
              onClick={toggleAudio}
              className={`nav-button ${
                isAudioEnabled ? "btn-success" : "btn-secondary"
              }`}
            >
              {isAudioEnabled ? "🎤 Mute" : "🔇 Unmute"}
            </button>

            <button
              onClick={toggleVideo}
              className={`nav-button ${
                isVideoEnabled ? "btn-success" : "btn-secondary"
              }`}
            >
              {isVideoEnabled ? "📹 Stop Video" : "📸 Start Video"}
            </button>
          </div>
        )}

        <div className="status-indicators">
          <span className="connection-info">
            WebRTC: <code>{connectionState}</code> | Signal:{" "}
            <code>{signalingServer?.getConnectionType?.() || "checking..."}</code>
          </span>

          <span
            className={`status-dot ${
              isAudioEnabled ? "audio-on" : "audio-off"
            }`}
          >
            🎤 {isAudioEnabled ? "On" : "Off"}
          </span>

          <span
            className={`status-dot ${
              isVideoEnabled ? "video-on" : "video-off"
            }`}
          >
            📹 {isVideoEnabled ? "On" : "Off"}
          </span>
        </div>

        <div className="info-box">
          <small>
            <strong>🎯 How to Call a Friend:</strong>
            <br />
            1. <strong>Share your portfolio URL</strong> with your friend
            <br />
            2. <strong>You click "Call a Friend"</strong> (becomes Caller)
            <br />
            3. <strong>Friend clicks "Join as Callee"</strong> (becomes Callee)
            <br />
            4. <strong>Grant camera/microphone</strong> permissions on both
            <br />
            5. <strong>Wait for connection</strong> (may take 10-15 seconds)
            <br />
            <br />
            <strong>🌐 Connection Types:</strong>
            <br />• <code>WebSocket</code>: Signaling transport
            <br />• <code>Mock</code>: Demo mode
            <br />• <code>Local Network</code>: Fastest when directly reachable
            <br />
            <br />
            <em>Tip: For best results, both use Chrome on HTTPS.</em>
          </small>
        </div>
      </div>
    </div>
  );
};

export default VideoChat;
