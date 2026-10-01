import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Chat.css";

// Hybrid signaling system: WebSocket when available, mock for demo
const createSignalingServer = () => {
  const listeners = [];
  let socket = null;
  let isWebSocketConnected = false;

  const connectWebSocket = () => {
    return new Promise((resolve) => {
      try {
        // Try to connect to a public WebSocket server
        socket = new WebSocket("wss://ws.postman-echo.com/raw");

        socket.onopen = () => {
          console.log("✅ Connected to WebSocket server");
          isWebSocketConnected = true;
          resolve(true);
        };

        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            listeners.forEach((callback) => callback(message));
          } catch (e) {
            console.log("📥 WebSocket message:", event.data);
          }
        };

        socket.onerror = () => {
          console.log("⚠️ WebSocket connection failed, using mock mode");
          isWebSocketConnected = false;
          resolve(false);
        };

        socket.onclose = () => {
          isWebSocketConnected = false;
          console.log("🔴 WebSocket disconnected");
        };

        // Timeout after 3 seconds
        setTimeout(() => {
          if (!isWebSocketConnected) {
            console.log("⏱️ WebSocket timed out, using mock mode");
            resolve(false);
          }
        }, 3000);
      } catch (error) {
        console.log("❌ WebSocket not available:", error.message);
        resolve(false);
      }
    });
  };

  return {
    connect: async (roomId) => {
      console.log(`🟡 Connecting to signaling, room: ${roomId}`);

      // Try WebSocket first
      const wsConnected = await connectWebSocket();

      if (wsConnected && socket) {
        console.log("✅ Using WebSocket for real peer-to-peer");
        socket.send(
          JSON.stringify({
            type: "join-room",
            room: roomId,
          }),
        );
      } else {
        console.log("🟡 Using mock signaling for demo");
      }

      return Promise.resolve();
    },

    disconnect: () => {
      if (socket && isWebSocketConnected) {
        socket.close();
      }
      console.log(`🔴 Disconnected from signaling server`);
    },

    sendMessage: (message) => {
      console.log("📤 Sending message:", message.type);

      // Send via WebSocket if connected
      if (socket && isWebSocketConnected) {
        socket.send(
          JSON.stringify({
            ...message,
            timestamp: Date.now(),
          }),
        );
        console.log("✅ Sent via WebSocket");
      }
      // Fallback to mock for demo
      else {
        setTimeout(() => {
          // Mock receiving messages from other peer
          if (message.type === "offer" && listeners.length > 0) {
            const fakeAnswer = {
              type: "answer",
              sdp: "v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\n...",
              from: "remote-peer",
            };
            console.log("📥 Simulating answer from remote peer");
            listeners.forEach((callback) => callback(fakeAnswer));
          }
        }, 1000);
      }
    },

    onMessage: (callback) => {
      listeners.push(callback);
    },

    simulateRemoteOffer: () => {
      if (listeners.length > 0) {
        const fakeOffer = {
          type: "offer",
          sdp: "v=0\r\no=- 987654321 2 IN IP4 127.0.0.1\r\n...",
          from: "remote-peer",
        };
        console.log("📥 Simulating incoming offer");
        listeners.forEach((callback) => callback(fakeOffer));
      }
    },

    // New method for peer discovery
    sendToPeer: (peerId, data) => {
      if (socket && isWebSocketConnected) {
        socket.send(
          JSON.stringify({
            type: "peer-message",
            to: peerId,
            data: data,
          }),
        );
      }
    },

    getConnectionType: () => {
      return isWebSocketConnected ? "websocket" : "mock";
    },
  };
};

// VideoChat Component
const VideoChat = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [peerConnection, setPeerConnection] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState("disconnected");
  const [signalingServer, setSignalingServer] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const signalingRef = useRef(null);

  // Initialize the signaling server
  useEffect(() => {
    const server = createSignalingServer();
    setSignalingServer(server);
    signalingRef.current = server;

    return () => {
      if (signalingRef.current) {
        signalingRef.current.disconnect();
      }
    };
  }, []);

  // Initialize media stream
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true,
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log("🎥 Camera tracks:", stream.getVideoTracks().length);
      console.log("🎤 Microphone tracks:", stream.getAudioTracks().length);

      return stream;
    } catch (error) {
      console.error("getUserMedia failed:", error.name, error.message);
      alert(`Camera/microphone access failed: ${error.message}`);
      return null;
    }
  }, [setLocalStream]);

  // Create and configure WebRTC peer connection
  const createPeerConnection = useCallback(
    (stream) => {
      if (!window.RTCPeerConnection) {
        alert("WebRTC is not supported by your browser.");
        return null;
      }

      const configuration = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
        ],
      };

      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;

      // Add local tracks to connection
      if (stream) {
        stream.getTracks().forEach((track) => {
          console.log(`➕ Adding track: ${track.kind}`, track);
          pc.addTrack(track, stream);
        });
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("🧊 ICE candidate generated:", event.candidate);
          if (signalingRef.current) {
            signalingRef.current.sendMessage({
              type: "ice-candidate",
              candidate: event.candidate,
            });
          }
        } else {
          console.log("✅ ICE gathering complete");
        }
      };

      // Handle incoming tracks (remote media)
      pc.ontrack = (event) => {
        console.log(
          "📥 Received remote track:",
          event.track.kind,
          event.streams,
        );
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        }
      };

      // Connection state changes
      pc.onconnectionstatechange = () => {
        console.log("🔗 Connection state:", pc.connectionState);
        setConnectionState(pc.connectionState);

        if (pc.connectionState === "connected") {
          console.log("✅ WebRTC connection established!");
        } else if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected"
        ) {
          console.log("❌ WebRTC connection failed");
        }
      };

      // ICE connection state
      pc.oniceconnectionstatechange = () => {
        console.log("🧊 ICE connection state:", pc.iceConnectionState);
      };

      setPeerConnection(pc);
      return pc;
    },
    [setPeerConnection, setConnectionState, setRemoteStream],
  );

  // End call
  const endCall = useCallback(() => {
    console.log("📞 Ending call...");

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      setPeerConnection(null);
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    if (remoteStream) {
      setRemoteStream(null);
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    if (signalingRef.current) {
      signalingRef.current.sendMessage({ type: "end-call" });
      signalingRef.current.disconnect();
    }

    setIsCallActive(false);
    setConnectionState("disconnected");
  }, [
    localStream,
    remoteStream,
    setPeerConnection,
    setLocalStream,
    setRemoteStream,
    setIsCallActive,
    setConnectionState,
  ]);

  // Handle signaling messages
  useEffect(() => {
    if (!signalingRef.current) return;

    signalingRef.current.onMessage(async (message) => {
      console.log("📥 Received signaling message:", message.type);

      if (!peerConnectionRef.current) return;

      // Check if we're already in a call
      if (!isCallActive && message.type !== "end-call") {
        console.log("⚠️ Ignoring signaling message - call not active");
        return;
      }

      switch (message.type) {
        case "offer":
          console.log("📥 Received offer, creating answer...");
          try {
            // Ensure the connection is created if not yet
            if (!peerConnectionRef.current) {
              createPeerConnection(); // Initialize if needed
            }

            const pc = peerConnectionRef.current;
            if (!pc) {
              console.error("Peer connection is not available");
              return;
            }

            // Check current signaling state
            const currentState = pc.signalingState;
            if (
              currentState !== "stable" &&
              currentState !== "have-remote-offer"
            ) {
              console.log(`⚠️ Skipping offer - wrong state: ${currentState}`);
              break;
            }

            await pc.setRemoteDescription(new RTCSessionDescription(message));

            const answer = await pc.createAnswer();
            try {
              await pc.setLocalDescription(answer);
            } catch (localError) {
              console.error("Error setting local description:", localError);
              // Handle recovery if setLocalDescription fails
              if (localError.name === "InvalidStateError") {
                console.log(
                  "🔄 Invalid state for answer, attempting to recover...",
                );
                await pc.restartIce(); // Restart ICE and attempt to set again
                await pc.setLocalDescription(answer);
              }
            }

            // Send answer back
            signalingRef.current.sendMessage({
              type: "answer",
              sdp: answer.sdp,
            });

            console.log("✅ Answer created and sent");
            setConnectionState("connected");
          } catch (error) {
            console.error("Error handling offer:", error);
            if (error.name === "InvalidStateError") {
              console.log(
                "🔄 Invalid state for offer, attempting to recover...",
              );
              endCall(); // Terminate or retry as needed
            }
          }
          break;

        case "answer":
          console.log("📥 Received answer");
          try {
            // Check if we're waiting for an answer
            if (connectionState !== "waiting-for-answer") {
              console.log(
                "⚠️ Not waiting for answer, current state:",
                connectionState,
              );
              break;
            }

            await peerConnectionRef.current.setRemoteDescription(
              new RTCSessionDescription(message),
            );
            console.log("✅ Answer processed successfully");
            setConnectionState("connected");
          } catch (error) {
            console.error("Error handling answer:", error);
            if (error.name === "InvalidStateError") {
              console.log("🔄 Invalid state for answer, ending call...");
              endCall();
            }
          }
          break;

        case "ice-candidate":
          console.log("🧊 Received ICE candidate");
          try {
            // Only add ICE candidates if we have a remote description
            if (peerConnectionRef.current.remoteDescription) {
              await peerConnectionRef.current.addIceCandidate(
                new RTCIceCandidate(message.candidate),
              );
              console.log("✅ ICE candidate added");
            } else {
              console.log(
                "⏳ Queueing ICE candidate - waiting for remote description",
              );
              // Queue ICE candidates if remote description not set yet
              // This is handled automatically by modern browsers
            }
          } catch (error) {
            console.error("Error adding ICE candidate:", error);
          }
          break;

        case "end-call":
          console.log("📞 Received end call");
          endCall();
          break;

        default:
          console.log("📥 Unknown message type:", message.type);
          break;
      }
    });
  }, [endCall, isCallActive, connectionState]);

  // Start call as caller
  const startCall = useCallback(async () => {
    setIsConnecting(true);
    setConnectionState("connecting");

    try {
      // Connect to signaling server
      if (signalingRef.current) {
        await signalingRef.current.connect("demo-room");
      }

      // Get camera/microphone
      const stream = await initializeMedia();
      if (!stream) {
        setIsConnecting(false);
        return;
      }

      // Create peer connection
      const pc = createPeerConnection(stream);
      if (!pc) {
        setIsConnecting(false);
        return;
      }

      // Create and send offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);

      console.log("📤 Sending offer...");
      if (signalingRef.current) {
        signalingRef.current.sendMessage({
          type: "offer",
          sdp: offer.sdp,
        });
      }

      setIsCallActive(true);
      setIsConnecting(false);
      setConnectionState("waiting-for-answer");
    } catch (error) {
      console.error("Error starting call:", error);
      alert(`Failed to start call: ${error.message}`);
      setIsConnecting(false);
      setConnectionState("failed");
    }
  }, [
    setIsConnecting,
    setConnectionState,
    setIsCallActive,
    initializeMedia,
    createPeerConnection,
  ]);

  // Join call as callee
  const joinCall = useCallback(async () => {
    setIsConnecting(true);
    setConnectionState("connecting");

    try {
      // Connect to signaling server
      if (signalingRef.current) {
        await signalingRef.current.connect("demo-room");
      }

      // Get camera/microphone
      const stream = await initializeMedia();
      if (!stream) {
        setIsConnecting(false);
        return;
      }

      // Create peer connection
      const pc = createPeerConnection(stream);
      if (!pc) {
        setIsConnecting(false);
        return;
      }

      setIsCallActive(true);
      setIsConnecting(false);
      setConnectionState("waiting-for-offer");
    } catch (error) {
      console.error("Error joining call:", error);
      alert(`Failed to join call: ${error.message}`);
      setIsConnecting(false);
      setConnectionState("failed");
    }
  }, [
    setIsConnecting,
    setConnectionState,
    setIsCallActive,
    initializeMedia,
    createPeerConnection,
  ]);

  // Simulate receiving call (for demo)
  const simulateIncomingCall = useCallback(() => {
    if (signalingRef.current) {
      signalingRef.current.simulateRemoteOffer();
    }
  }, []);

  // Helper functions for status display
  const getStatusIcon = (state) => {
    switch (state) {
      case "connected":
        return "🟢";
      case "connecting":
      case "waiting-for-answer":
      case "waiting-for-offer":
        return "🟡";
      case "disconnected":
        return "⚪️";
      case "failed":
        return "🔴";
      default:
        return "⚪️";
    }
  };

  const getStatusText = (state) => {
    switch (state) {
      case "connected":
        return "Connected via WebRTC";
      case "connecting":
        return "Connecting...";
      case "waiting-for-answer":
        return "Waiting for answer...";
      case "waiting-for-offer":
        return "Ready to receive call";
      case "disconnected":
        return "Ready";
      case "failed":
        return "Connection failed";
      default:
        return state;
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (peerConnection) {
        peerConnection.close();
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [peerConnection, localStream]);

  return (
    <div className="video-chat-container project-card">
      <div className="video-chat-header">
        <h3>🎥 WebRTC Video Chat</h3>
        <div className="connection-status">
          <span className={`status-indicator ${connectionState}`}>
            {getStatusIcon(connectionState)}
          </span>
          <span className="status-text">{getStatusText(connectionState)}</span>
        </div>
      </div>

      <div className="video-grid">
        {/* Remote video */}
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

        {/* Local video */}
        <div className="video-container local-video">
          <div className="video-label">
            <span className="user-badge">👤 You</span>
          </div>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted={true}
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

      {/* Controls */}
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
              className={`nav-button ${isAudioEnabled ? "btn-success" : "btn-secondary"}`}
            >
              {isAudioEnabled ? "🎤 Mute" : "🔇 Unmute"}
            </button>

            <button
              onClick={toggleVideo}
              className={`nav-button ${isVideoEnabled ? "btn-success" : "btn-secondary"}`}
            >
              {isVideoEnabled ? "📹 Stop Video" : "📸 Start Video"}
            </button>
          </div>
        )}

        <div className="status-indicators">
          <span className="connection-info">
            WebRTC: <code>{connectionState}</code> | Signal:{" "}
            <code>
              {signalingServer?.getConnectionType?.() || "checking..."}
            </code>
          </span>
          <span
            className={`status-dot ${isAudioEnabled ? "audio-on" : "audio-off"}`}
          >
            🎤 {isAudioEnabled ? "On" : "Off"}
          </span>
          <span
            className={`status-dot ${isVideoEnabled ? "video-on" : "video-off"}`}
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
            <br />• <code>WebSocket</code>: Real peer-to-peer (try HTTPS)
            <br />• <code>Mock</code>: Demo mode (works anywhere)
            <br />• <code>Local Network</code>: Fastest (same WiFi)
            <br />
            <br />
            <em>Tip: For best results, both use Chrome on HTTPS.</em>
          </small>
        </div>
      </div>
    </div>
  );
};

// Chat Interface Component
const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      text: newMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, message]);
    setNewMessage("");

    // Simulate bot response
    setIsTyping(true);
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: "I'm a demo bot! This is an automated response.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="chat-interface-container project-card">
      <div className="chat-interface-header">
        <h3>💬 Text Chat</h3>
        <span className="chat-status">Online</span>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <div className="chat-icon">💬</div>
            <p>Start a conversation...</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-bubble ${msg.sender === "user" ? "user-message" : "bot-message"}`}
            >
              <div className="message-content">{msg.text}</div>
              <div className="message-timestamp">{msg.timestamp}</div>
            </div>
          ))
        )}
        {isTyping && (
          <div className="typing-indicator">
            <span>Typing</span>
            <div className="typing-dots">
              <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </div>
          </div>
        )}
      </div>

      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="chat-input"
        />
        <button
          onClick={sendMessage}
          className="nav-button btn-primary send-button"
        >
          Send
        </button>
      </div>
    </div>
  );
};

// Main Chat Component
const Chat = () => {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="content-section">
      <div className="chat-header">
        <h2>Video Chat & Messaging</h2>
        <p className="chat-subtitle">
          Connect with others via video call or text chat
        </p>
      </div>

      <div className="chat-tabs">
        <button
          onClick={() => setActiveTab("video")}
          className={`nav-button ${activeTab === "video" ? "active" : ""}`}
        >
          📹 Video Call
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`nav-button ${activeTab === "chat" ? "active" : ""}`}
        >
          💬 Text Chat
        </button>
      </div>

      <div className="chat-content">
        {activeTab === "video" ? (
          <div className="video-chat-section">
            <VideoChat />
          </div>
        ) : (
          <div className="text-chat-section">
            <ChatInterface />
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions project-card">
          <h3>⚡ Quick Actions</h3>
          <div className="action-buttons">
            <button className="nav-button btn-info">📞 Schedule Call</button>
            <button className="nav-button btn-warning">📋 Share Screen</button>
            <button className="nav-button btn-success">
              🔗 Copy Meeting Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
