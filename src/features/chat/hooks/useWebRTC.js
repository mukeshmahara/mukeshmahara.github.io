import { useCallback, useEffect, useRef, useState } from "react";
import { createSignalingServer } from "../services/signalingServer";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
];

export const useWebRTC = ({
  localVideoRef,
  remoteVideoRef,
  roomId = "demo-room",
}) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionState, setConnectionState] = useState("disconnected");
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [signalingServer, setSignalingServer] = useState(null);

  const peerConnectionRef = useRef(null);
  const signalingRef = useRef(null);

  useEffect(() => {
    const signaling = createSignalingServer();

    signalingRef.current = signaling;
    setSignalingServer(signaling);

    return () => {
      signaling.disconnect();
    };
  }, []);

  const initializeMedia = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera and microphone access is not supported.");
      }

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
  }, [localVideoRef]);

  const createPeerConnection = useCallback(
    (stream) => {
      if (!window.RTCPeerConnection) {
        alert("WebRTC is not supported by your browser.");
        return null;
      }

      const peerConnection = new RTCPeerConnection({
        iceServers: ICE_SERVERS,
      });

      peerConnectionRef.current = peerConnection;

      stream?.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });

      peerConnection.onicecandidate = (event) => {
        if (!event.candidate) {
          console.log("✅ ICE gathering complete");
          return;
        }

        signalingRef.current?.sendMessage({
          type: "ice-candidate",
          candidate: event.candidate,
        });
      };

      peerConnection.ontrack = (event) => {
        const stream = event.streams?.[0];

        if (!stream) return;

        setRemoteStream(stream);

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      };

      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;

        console.log("🔗 Connection state:", state);
        setConnectionState(state);

        if (state === "connected") {
          console.log("✅ WebRTC connection established!");
        }
      };

      peerConnection.oniceconnectionstatechange = () => {
        console.log(
          "🧊 ICE connection state:",
          peerConnection.iceConnectionState,
        );
      };

      return peerConnection;
    },
    [remoteVideoRef],
  );

  const endCall = useCallback(() => {
    console.log("📞 Ending call...");

    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    localStream?.getTracks().forEach((track) => track.stop());

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    signalingRef.current?.sendMessage({ type: "end-call" });
    signalingRef.current?.disconnect();

    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
    setConnectionState("disconnected");
  }, [localStream, localVideoRef, remoteVideoRef]);

  const handleSignalingMessage = useCallback(
    async (message) => {
      const peerConnection = peerConnectionRef.current;

      if (!peerConnection) return;

      try {
        switch (message.type) {
          case "offer": {
            if (
              peerConnection.signalingState !== "stable" &&
              peerConnection.signalingState !== "have-remote-offer"
            ) {
              console.log(
                `⚠️ Skipping offer - wrong state: ${peerConnection.signalingState}`,
              );
              return;
            }

            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(message),
            );

            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            signalingRef.current?.sendMessage({
              type: "answer",
              sdp: answer.sdp,
            });

            setConnectionState("connected");
            break;
          }

          case "answer":
            if (connectionState !== "waiting-for-answer") return;

            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(message),
            );

            console.log("✅ Answer processed successfully");
            setConnectionState("connected");
            break;

          case "ice-candidate":
            if (!peerConnection.remoteDescription) {
              console.log("⏳ Remote description is not ready yet");
              return;
            }

            await peerConnection.addIceCandidate(
              new RTCIceCandidate(message.candidate),
            );

            console.log("✅ ICE candidate added");
            break;

          case "end-call":
            endCall();
            break;

          default:
            console.log("📥 Unknown message type:", message.type);
        }
      } catch (error) {
        console.error(
          `Error handling signaling message "${message.type}":`,
          error,
        );

        if (error.name === "InvalidStateError") {
          endCall();
        }
      }
    },
    [connectionState, endCall],
  );

  useEffect(() => {
    if (!signalingServer) return;

    return signalingServer.onMessage(handleSignalingMessage);
  }, [signalingServer, handleSignalingMessage]);

  const startCall = useCallback(async () => {
    setIsConnecting(true);
    setConnectionState("connecting");

    try {
      await signalingRef.current?.connect(roomId);

      const stream = await initializeMedia();
      if (!stream) return;

      const peerConnection = createPeerConnection(stream);
      if (!peerConnection) return;

      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await peerConnection.setLocalDescription(offer);

      signalingRef.current?.sendMessage({
        type: "offer",
        sdp: offer.sdp,
      });

      setIsCallActive(true);
      setConnectionState("waiting-for-answer");
    } catch (error) {
      console.error("Error starting call:", error);
      alert(`Failed to start call: ${error.message}`);
      setConnectionState("failed");
    } finally {
      setIsConnecting(false);
    }
  }, [createPeerConnection, initializeMedia, roomId]);

  const joinCall = useCallback(async () => {
    setIsConnecting(true);
    setConnectionState("connecting");

    try {
      await signalingRef.current?.connect(roomId);

      const stream = await initializeMedia();
      if (!stream) return;

      const peerConnection = createPeerConnection(stream);
      if (!peerConnection) return;

      setIsCallActive(true);
      setConnectionState("waiting-for-offer");
    } catch (error) {
      console.error("Error joining call:", error);
      alert(`Failed to join call: ${error.message}`);
      setConnectionState("failed");
    } finally {
      setIsConnecting(false);
    }
  }, [createPeerConnection, initializeMedia, roomId]);

  const simulateIncomingCall = useCallback(() => {
    signalingRef.current?.simulateRemoteOffer();
  }, []);

  const toggleAudio = useCallback(() => {
    const track = localStream?.getAudioTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setIsAudioEnabled(track.enabled);
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    const track = localStream?.getVideoTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setIsVideoEnabled(track.enabled);
  }, [localStream]);

  useEffect(() => {
    return () => {
      peerConnectionRef.current?.close();
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, [localStream]);

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
    simulateIncomingCall,
  };
};
