import { useCallback, useEffect, useRef, useState } from "react";
import { createSignalingServer } from "../services/signaling";

const ICE_SERVERS = [
  {
    urls: "stun:stun.l.google.com:19302",
  },
  {
    urls: "stun:stun1.l.google.com:19302",
  },
  {
    urls: "stun:stun2.l.google.com:19302",
  },
  {
    urls: "stun:stun3.l.google.com:19302",
  },
];

export const useWebRTC = ({
  localVideoRef,
  remoteVideoRef,
  roomId = "demo-room",
}) => {
  // --------------------------------------------------
  // State
  // --------------------------------------------------

  const [isCallActive, setIsCallActive] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionState, setConnectionState] = useState("disconnected");

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const [signalingServer, setSignalingServer] = useState(null);

  // --------------------------------------------------
  // Refs
  // --------------------------------------------------

  const peerConnectionRef = useRef(null);
  const signalingRef = useRef(null);

  // Local stream ref prevents cleanup from depending
  // directly on React state.
  const localStreamRef = useRef(null);

  // ICE candidates can arrive before remoteDescription.
  const pendingIceCandidatesRef = useRef([]);

  // Whether this browser started the call.
  const isCallerRef = useRef(false);

  // Prevent duplicate offers.
  const offerCreatedRef = useRef(false);

  // Prevent handling signaling after cleanup.
  const isCallEndingRef = useRef(false);

  // --------------------------------------------------
  // Create signaling server
  // --------------------------------------------------

  useEffect(() => {
    const signaling = createSignalingServer();

    signalingRef.current = signaling;
    setSignalingServer(signaling);

    return () => {
      console.log("🧹 Cleaning up signaling server");

      signaling.disconnect();

      if (signalingRef.current === signaling) {
        signalingRef.current = null;
      }
    };
  }, []);

  // --------------------------------------------------
  // Initialize camera + microphone
  // --------------------------------------------------

  const initializeMedia = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Camera and microphone access is not supported by this browser.",
        );
      }

      console.log("🎥 Requesting camera and microphone...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
        },
        audio: true,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log("🎥 Camera tracks:", stream.getVideoTracks().length);

      console.log("🎤 Microphone tracks:", stream.getAudioTracks().length);

      return stream;
    } catch (error) {
      console.error("❌ getUserMedia failed:", error.name, error.message);

      alert(`Camera/microphone access failed: ${error.message}`);

      return null;
    }
  }, [localVideoRef]);

  // --------------------------------------------------
  // Flush queued ICE candidates
  // --------------------------------------------------

  const flushPendingIceCandidates = useCallback(async (peerConnection) => {
    const candidates = pendingIceCandidatesRef.current;

    if (!candidates.length) {
      return;
    }

    console.log(`🧊 Adding ${candidates.length} queued ICE candidates`);

    pendingIceCandidatesRef.current = [];

    for (const candidate of candidates) {
      try {
        if (peerConnection.signalingState === "closed") {
          console.warn("⚠️ Peer connection closed while adding ICE candidate");

          return;
        }

        await peerConnection.addIceCandidate(candidate);

        console.log("✅ Queued ICE candidate added");
      } catch (error) {
        console.error("❌ Failed to add queued ICE candidate:", error);
      }
    }
  }, []);

  // --------------------------------------------------
  // Create RTCPeerConnection
  // --------------------------------------------------

  const createPeerConnection = useCallback(
    (stream) => {
      if (!window.RTCPeerConnection) {
        alert("WebRTC is not supported by your browser.");
        return null;
      }

      // If there is an old connection, close it first.
      const existingConnection = peerConnectionRef.current;

      if (existingConnection) {
        console.log("🧹 Closing existing peer connection");

        existingConnection.ontrack = null;
        existingConnection.onicecandidate = null;
        existingConnection.onconnectionstatechange = null;
        existingConnection.oniceconnectionstatechange = null;
        existingConnection.onsignalingstatechange = null;

        if (existingConnection.signalingState !== "closed") {
          existingConnection.close();
        }

        peerConnectionRef.current = null;
      }

      pendingIceCandidatesRef.current = [];

      const peerConnection = new RTCPeerConnection({
        iceServers: ICE_SERVERS,
      });

      peerConnectionRef.current = peerConnection;

      console.log("🔗 New RTCPeerConnection created");

      // ------------------------------------------------
      // Add local tracks
      // ------------------------------------------------

      stream?.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      console.log("📡 Local tracks added:", stream?.getTracks().length || 0);

      // ------------------------------------------------
      // ICE candidate
      // ------------------------------------------------

      peerConnection.onicecandidate = (event) => {
        if (!event.candidate) {
          console.log("✅ ICE gathering complete");
          return;
        }

        if (peerConnection.signalingState === "closed") {
          console.warn(
            "⚠️ Ignoring ICE candidate because peer connection is closed",
          );

          return;
        }

        console.log("🧊 Sending ICE candidate");

        signalingRef.current?.sendMessage({
          type: "ice-candidate",
          candidate: event.candidate,
        });
      };

      // ------------------------------------------------
      // Remote media
      // ------------------------------------------------

      peerConnection.ontrack = (event) => {
        console.log("🎥 Received remote track");

        const stream = event.streams?.[0];

        if (!stream) {
          console.warn("⚠️ Remote track has no stream");
          return;
        }

        setRemoteStream(stream);

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      };

      // ------------------------------------------------
      // WebRTC connection state
      // ------------------------------------------------

      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;

        console.log("🔗 WebRTC connection state:", state);

        setConnectionState(state);

        switch (state) {
          case "connected":
            console.log("✅ WebRTC connection established!");

            setIsCallActive(true);
            setIsConnecting(false);

            break;

          case "connecting":
            setIsConnecting(true);
            break;

          case "disconnected":
            console.log("⚠️ WebRTC connection disconnected");
            break;

          case "failed":
            console.error("❌ WebRTC connection failed");

            setIsCallActive(false);
            setIsConnecting(false);

            break;

          case "closed":
            console.log("🔴 WebRTC connection closed");

            setIsCallActive(false);
            setIsConnecting(false);

            break;

          default:
            break;
        }
      };

      // ------------------------------------------------
      // ICE connection state
      // ------------------------------------------------

      peerConnection.oniceconnectionstatechange = () => {
        console.log(
          "🧊 ICE connection state:",
          peerConnection.iceConnectionState,
        );
      };

      // ------------------------------------------------
      // Signaling state
      // ------------------------------------------------

      peerConnection.onsignalingstatechange = () => {
        console.log("📡 Signaling state:", peerConnection.signalingState);
      };

      return peerConnection;
    },
    [remoteVideoRef],
  );

  // --------------------------------------------------
  // Cleanup WebRTC only
  // --------------------------------------------------

  const cleanupPeerConnection = useCallback(() => {
    console.log("🧹 Cleaning up WebRTC connection");

    const peerConnection = peerConnectionRef.current;

    if (peerConnection) {
      peerConnection.ontrack = null;
      peerConnection.onicecandidate = null;
      peerConnection.onconnectionstatechange = null;
      peerConnection.oniceconnectionstatechange = null;
      peerConnection.onsignalingstatechange = null;

      if (peerConnection.signalingState !== "closed") {
        peerConnection.close();
      }

      peerConnectionRef.current = null;
    }

    // Stop local camera/microphone.
    const stream = localStreamRef.current;

    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    localStreamRef.current = null;

    // Clear video elements.
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Reset ICE state.
    pendingIceCandidatesRef.current = [];

    // Reset call flags.
    offerCreatedRef.current = false;
    isCallerRef.current = false;

    // Reset React state.
    setLocalStream(null);
    setRemoteStream(null);

    setIsCallActive(false);
    setIsConnecting(false);
    setConnectionState("disconnected");

    setIsAudioEnabled(true);
    setIsVideoEnabled(true);
  }, [localVideoRef, remoteVideoRef]);

  // --------------------------------------------------
  // End call
  // --------------------------------------------------

  const endCall = useCallback(() => {
    console.log("📞 Ending call...");

    isCallEndingRef.current = true;

    cleanupPeerConnection();

    // Disconnect signaling.
    if (signalingRef.current) {
      signalingRef.current.disconnect();
      signalingRef.current = null;
    }

    setSignalingServer(null);

    console.log("📞 Call ended");
  }, [cleanupPeerConnection]);

  // --------------------------------------------------
  // Create and send offer
  // --------------------------------------------------

  const createAndSendOffer = useCallback(async () => {
    const peerConnection = peerConnectionRef.current;

    if (isCallEndingRef.current) {
      console.warn("⚠️ Cannot create offer: call is ending");
      return;
    }

    if (!peerConnection) {
      console.warn("⚠️ Cannot create offer: no peer connection");
      return;
    }

    if (peerConnection.signalingState === "closed") {
      console.warn("⚠️ Cannot create offer: peer connection is closed");

      return;
    }

    if (peerConnection.connectionState === "closed") {
      console.warn("⚠️ Cannot create offer: connection state is closed");

      return;
    }

    if (offerCreatedRef.current) {
      console.log("ℹ️ Offer already created");
      return;
    }

    try {
      console.log("📤 Creating WebRTC offer...");

      offerCreatedRef.current = true;

      const offer = await peerConnection.createOffer();

      // Make sure the connection wasn't closed while
      // createOffer() was running.
      if (peerConnection.signalingState === "closed") {
        console.warn(
          "⚠️ Peer connection closed before setting local description",
        );

        offerCreatedRef.current = false;

        return;
      }

      await peerConnection.setLocalDescription(offer);

      if (peerConnection.signalingState === "closed") {
        console.warn("⚠️ Peer connection closed before sending offer");

        offerCreatedRef.current = false;

        return;
      }

      signalingRef.current?.sendMessage({
        type: "offer",
        offer: peerConnection.localDescription,
      });

      setConnectionState("waiting-for-answer");

      console.log("📤 Offer sent successfully");
    } catch (error) {
      offerCreatedRef.current = false;

      console.error("❌ Failed to create offer:", error);
    }
  }, []);

  // --------------------------------------------------
  // Handle signaling messages
  // --------------------------------------------------

  const handleSignalingMessage = useCallback(
    async (message) => {
      if (!message) {
        return;
      }

      if (isCallEndingRef.current) {
        console.log(
          "ℹ️ Ignoring signaling message because call is ending:",
          message.type,
        );

        return;
      }

      console.log("📨 Signaling message:", message.type);

      try {
        switch (message.type) {
          // --------------------------------------------
          // Room joined
          // --------------------------------------------

          case "room-joined": {
            console.log("🚪 Joined room:", message.roomId);

            break;
          }

          // --------------------------------------------
          // Another user joined
          // --------------------------------------------

          case "user-joined": {
            console.log("👤 User joined:", message.socketId);

            if (!isCallerRef.current) {
              console.log("ℹ️ This peer is not the caller");

              break;
            }

            const peerConnection = peerConnectionRef.current;

            if (!peerConnection) {
              console.warn("⚠️ User joined, but no peer connection exists");

              break;
            }

            if (peerConnection.signalingState === "closed") {
              console.warn("⚠️ User joined, but peer connection is closed");

              break;
            }

            if (offerCreatedRef.current) {
              console.log("ℹ️ Offer already created");

              break;
            }

            await createAndSendOffer();

            break;
          }

          // --------------------------------------------
          // Offer received
          // --------------------------------------------

          case "offer": {
            console.log("📥 Received offer");

            const peerConnection = peerConnectionRef.current;

            if (!peerConnection) {
              console.warn("⚠️ No peer connection for offer");

              return;
            }

            if (peerConnection.signalingState === "closed") {
              console.warn("⚠️ Cannot process offer: peer connection closed");

              return;
            }

            if (peerConnection.signalingState !== "stable") {
              console.warn(
                "⚠️ Cannot process offer in state:",
                peerConnection.signalingState,
              );

              return;
            }

            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(message.offer),
            );

            console.log("✅ Remote offer description set");

            await flushPendingIceCandidates(peerConnection);

            const answer = await peerConnection.createAnswer();

            if (peerConnection.signalingState === "closed") {
              console.warn("⚠️ Peer connection closed while creating answer");

              return;
            }

            await peerConnection.setLocalDescription(answer);

            signalingRef.current?.sendMessage({
              type: "answer",
              answer: peerConnection.localDescription,
            });

            setConnectionState("answering");

            console.log("📤 Answer sent");

            break;
          }

          // --------------------------------------------
          // Answer received
          // --------------------------------------------

          case "answer": {
            console.log("📥 Received answer");

            const peerConnection = peerConnectionRef.current;

            if (!peerConnection) {
              console.warn("⚠️ No peer connection for answer");

              return;
            }

            if (peerConnection.signalingState === "closed") {
              console.warn("⚠️ Cannot process answer: peer connection closed");

              return;
            }

            if (peerConnection.signalingState !== "have-local-offer") {
              console.warn(
                "⚠️ Cannot process answer in state:",
                peerConnection.signalingState,
              );

              return;
            }

            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(message.answer),
            );

            console.log("✅ Remote answer description set");

            await flushPendingIceCandidates(peerConnection);

            setConnectionState("connecting");

            break;
          }

          // --------------------------------------------
          // ICE candidate
          // --------------------------------------------

          case "ice-candidate": {
            const peerConnection = peerConnectionRef.current;

            if (!peerConnection) {
              console.warn("⚠️ No peer connection for ICE candidate");

              return;
            }

            if (peerConnection.signalingState === "closed") {
              console.warn("⚠️ Ignoring ICE candidate: connection closed");

              return;
            }

            const candidate = new RTCIceCandidate(message.candidate);

            if (!peerConnection.remoteDescription) {
              console.log("🧊 Queueing ICE candidate");

              pendingIceCandidatesRef.current.push(candidate);

              return;
            }

            try {
              await peerConnection.addIceCandidate(candidate);

              console.log("✅ ICE candidate added");
            } catch (error) {
              console.error("❌ Failed to add ICE candidate:", error);
            }

            break;
          }

          // --------------------------------------------
          // User left
          // --------------------------------------------

          case "user-left": {
            console.log("👋 Remote user left");

            // Important:
            // Do NOT call endCall() here because that
            // disconnects our signaling server too.
            cleanupPeerConnection();

            break;
          }

          // --------------------------------------------
          // Signaling disconnected
          // --------------------------------------------

          case "disconnected": {
            console.log("🔴 Signaling disconnected");

            break;
          }

          // --------------------------------------------
          // Connection error
          // --------------------------------------------

          case "connection-error": {
            console.error("❌ Signaling connection error:", message.error);

            setConnectionState("failed");

            break;
          }

          // --------------------------------------------
          // Unknown
          // --------------------------------------------

          default:
            console.log("📥 Unknown signaling message:", message.type);
        }
      } catch (error) {
        console.error(`❌ Error handling "${message.type}":`, error);

        setConnectionState("failed");
      }
    },
    [cleanupPeerConnection, createAndSendOffer, flushPendingIceCandidates],
  );

  // --------------------------------------------------
  // Subscribe to signaling messages
  // --------------------------------------------------

  useEffect(() => {
    if (!signalingServer) {
      return undefined;
    }

    console.log("📡 Subscribing to signaling messages");

    const unsubscribe = signalingServer.onMessage(handleSignalingMessage);

    return () => {
      console.log("📡 Unsubscribing from signaling messages");

      unsubscribe?.();
    };
  }, [signalingServer, handleSignalingMessage]);

  // --------------------------------------------------
  // Start call
  // --------------------------------------------------

  const startCall = useCallback(async () => {
    if (!roomId) {
      alert("Room ID is required");
      return;
    }

    console.log("📞 Starting call:", roomId);

    isCallEndingRef.current = false;
    isCallerRef.current = true;
    offerCreatedRef.current = false;

    setIsConnecting(true);
    setConnectionState("connecting");

    try {
      // Get camera and microphone.
      const stream = await initializeMedia();

      if (!stream) {
        setIsConnecting(false);
        return;
      }

      // Create WebRTC peer connection.
      const peerConnection = createPeerConnection(stream);

      if (!peerConnection) {
        setIsConnecting(false);
        return;
      }

      // Connect to signaling server.
      if (!signalingRef.current) {
        console.error("❌ Signaling server is not initialized");

        cleanupPeerConnection();

        return;
      }

      signalingRef.current.connect(roomId);

      /*
       * IMPORTANT:
       *
       * We DO NOT create an offer here.
       *
       * We wait for:
       *
       *     user-joined
       *
       * This prevents the caller from sending an offer
       * before the second participant has joined.
       */

      setConnectionState("waiting-for-peer");
    } catch (error) {
      console.error("❌ Error starting call:", error);

      cleanupPeerConnection();

      setConnectionState("failed");

      alert(`Failed to start call: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  }, [roomId, initializeMedia, createPeerConnection, cleanupPeerConnection]);

  // --------------------------------------------------
  // Join existing call
  // --------------------------------------------------

  const joinCall = useCallback(async () => {
    if (!roomId) {
      alert("Room ID is required");
      return;
    }

    console.log("📞 Joining call:", roomId);

    isCallEndingRef.current = false;
    isCallerRef.current = false;
    offerCreatedRef.current = false;

    setIsConnecting(true);
    setConnectionState("connecting");

    try {
      // Get camera and microphone.
      const stream = await initializeMedia();

      if (!stream) {
        setIsConnecting(false);
        return;
      }

      // Create WebRTC peer connection.
      const peerConnection = createPeerConnection(stream);

      if (!peerConnection) {
        setIsConnecting(false);
        return;
      }

      if (!signalingRef.current) {
        console.error("❌ Signaling server is not initialized");

        cleanupPeerConnection();

        return;
      }

      // Join the room.
      signalingRef.current.connect(roomId);

      /*
       * The callee does NOT create an offer.
       *
       * It waits for:
       *
       *     offer
       *
       * from the caller.
       */

      setConnectionState("waiting-for-offer");
    } catch (error) {
      console.error("❌ Error joining call:", error);

      cleanupPeerConnection();

      setConnectionState("failed");

      alert(`Failed to join call: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  }, [roomId, initializeMedia, createPeerConnection, cleanupPeerConnection]);

  // --------------------------------------------------
  // Toggle microphone
  // --------------------------------------------------

  const toggleAudio = useCallback(() => {
    const stream = localStreamRef.current;

    if (!stream) {
      return;
    }

    const track = stream.getAudioTracks()[0];

    if (!track) {
      return;
    }

    track.enabled = !track.enabled;

    setIsAudioEnabled(track.enabled);

    console.log("🎤 Microphone:", track.enabled ? "enabled" : "disabled");
  }, []);

  // --------------------------------------------------
  // Toggle camera
  // --------------------------------------------------

  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;

    if (!stream) {
      return;
    }

    const track = stream.getVideoTracks()[0];

    if (!track) {
      return;
    }

    track.enabled = !track.enabled;

    setIsVideoEnabled(track.enabled);

    console.log("🎥 Camera:", track.enabled ? "enabled" : "disabled");
  }, []);

  // --------------------------------------------------
  // Component cleanup
  // --------------------------------------------------

  useEffect(() => {
    const localVideoElement = localVideoRef.current;
    const remoteVideoElement = remoteVideoRef.current;

    return () => {
      console.log("🧹 useWebRTC component cleanup");

      isCallEndingRef.current = true;

      // --------------------------------------------
      // Close WebRTC connection
      // --------------------------------------------

      const peerConnection = peerConnectionRef.current;

      if (peerConnection) {
        peerConnection.ontrack = null;
        peerConnection.onicecandidate = null;
        peerConnection.onconnectionstatechange = null;
        peerConnection.oniceconnectionstatechange = null;
        peerConnection.onsignalingstatechange = null;

        if (peerConnection.signalingState !== "closed") {
          peerConnection.close();
        }

        peerConnectionRef.current = null;
      }

      // --------------------------------------------
      // Stop local media
      // --------------------------------------------

      const stream = localStreamRef.current;

      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }

      localStreamRef.current = null;

      // --------------------------------------------
      // Clear video elements
      // --------------------------------------------

      if (localVideoElement) {
        localVideoElement.srcObject = null;
      }

      if (remoteVideoElement) {
        remoteVideoElement.srcObject = null;
      }

      // --------------------------------------------
      // Disconnect signaling
      // --------------------------------------------

      signalingRef.current?.disconnect();
      signalingRef.current = null;

      // --------------------------------------------
      // Reset refs
      // --------------------------------------------

      pendingIceCandidatesRef.current = [];
      offerCreatedRef.current = false;
      isCallerRef.current = false;
    };
  }, [localVideoRef, remoteVideoRef]);
  // --------------------------------------------------
  // Return API
  // --------------------------------------------------

  return {
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
  };
};
