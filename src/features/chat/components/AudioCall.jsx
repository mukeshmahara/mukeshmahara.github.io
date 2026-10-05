import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Phone,
  PhoneCall,
  PhoneOff,
  Volume2,
} from "lucide-react";

const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

const AudioCall = ({ roomId, signaling, isConnected }) => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState("Ready");
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCallPending, setIsCallPending] = useState(false);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(true);
  const [remoteVolume, setRemoteVolume] = useState(1);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState("");

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const pendingOfferRef = useRef(false);
  const remoteAudioRef = useRef(null);
  const mountedRef = useRef(false);

  const cleanupCall = useCallback(() => {
    const peerConnection = peerConnectionRef.current;
    if (peerConnection) {
      peerConnection.ontrack = null;
      peerConnection.onicecandidate = null;
      peerConnection.onconnectionstatechange = null;
      peerConnection.close();
      peerConnectionRef.current = null;
    }

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    pendingCandidatesRef.current = [];

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    setIsCallActive(false);
    setIsCallPending(false);
    setIsMicrophoneEnabled(true);
  }, []);

  const sendCallSignal = useCallback(
    (action, data = {}) =>
      signaling?.sendMessage({
        type: "audio-call",
        message: { action, ...data },
      }),
    [signaling],
  );

  const addPendingCandidates = async (peerConnection) => {
    const candidates = pendingCandidatesRef.current;
    pendingCandidatesRef.current = [];
    for (const candidate of candidates) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const createPeerConnection = useCallback((stream) => {
    if (!window.RTCPeerConnection) {
      throw new Error("Audio calling is not supported by this browser.");
    }

    const peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peerConnectionRef.current = peerConnection;

    stream.getAudioTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendCallSignal("ice-candidate", {
          candidate: event.candidate.toJSON(),
        });
      }
    };

    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteAudioRef.current && remoteStream) {
        remoteAudioRef.current.srcObject = remoteStream;
        remoteAudioRef.current.play().catch(() => {
          setError("Use the audio player to start playback.");
        });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      if (!mountedRef.current) {
        return;
      }

      if (peerConnection.connectionState === "connected") {
        setIsCallActive(true);
        setIsCallPending(false);
        setCallStatus("In call");
        setError("");
      } else if (
        peerConnection.connectionState === "failed" ||
        peerConnection.connectionState === "closed"
      ) {
        cleanupCall();
        setCallStatus("Call ended");
      }
    };

    return peerConnection;
  }, [cleanupCall, sendCallSignal]);

  const acquireMicrophone = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Microphone access is not supported by this browser.");
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (!mountedRef.current) {
      stream.getTracks().forEach((track) => track.stop());
      throw new Error("The chat was closed before microphone access completed.");
    }
    localStreamRef.current = stream;
    return stream;
  };

  useEffect(() => {
    mountedRef.current = true;
    if (!signaling || !roomId) {
      return () => {
        mountedRef.current = false;
      };
    }

    const handleSignaling = async (event) => {
      if (event.type === "user-left") {
        cleanupCall();
        pendingOfferRef.current = false;
        setIncomingCall(null);
        setCallStatus("Peer left the room");
        return;
      }

      if (
        event.type !== "audio-call" ||
        event.roomId !== roomId ||
        event.from === signaling.getSocketId()
      ) {
        return;
      }

      try {
        switch (event.action) {
          case "offer":
            if (peerConnectionRef.current || pendingOfferRef.current) {
              sendCallSignal("busy");
              return;
            }
            pendingOfferRef.current = true;
            setIncomingCall({ from: event.from, offer: event.offer });
            setIsCallPending(false);
            setCallStatus("Incoming call");
            setError("");
            break;

          case "answer": {
            const peerConnection = peerConnectionRef.current;
            if (
              !peerConnection ||
              peerConnection.signalingState !== "have-local-offer"
            ) {
              return;
            }
            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(event.answer),
            );
            await addPendingCandidates(peerConnection);
            setIsCallPending(true);
            setCallStatus("Connecting...");
            break;
          }

          case "ice-candidate": {
            if (!event.candidate) {
              return;
            }
            const peerConnection = peerConnectionRef.current;
            if (peerConnection?.remoteDescription) {
              await peerConnection.addIceCandidate(
                new RTCIceCandidate(event.candidate),
              );
            } else {
              pendingCandidatesRef.current.push(event.candidate);
            }
            break;
          }

          case "end":
          case "reject":
            cleanupCall();
            pendingOfferRef.current = false;
            setIncomingCall(null);
            setCallStatus(event.action === "reject" ? "Call declined" : "Call ended");
            break;

          case "busy":
            setCallStatus("Peer is busy");
            cleanupCall();
            break;

          default:
            break;
        }
      } catch (callError) {
        cleanupCall();
        pendingOfferRef.current = false;
        setIncomingCall(null);
        setCallStatus("Call failed");
        setError(`Audio call failed: ${callError.message}`);
      }
    };

    const unsubscribe = signaling.onMessage(handleSignaling);
    return () => {
      mountedRef.current = false;
      unsubscribe();
      cleanupCall();
    };
  }, [cleanupCall, roomId, sendCallSignal, signaling]);

  useEffect(() => {
    if (!isCallActive) {
      setCallDuration(0);
      return undefined;
    }

    const timer = window.setInterval(
      () => setCallDuration((duration) => duration + 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [isCallActive]);

  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.volume = remoteVolume;
    }
  }, [remoteVolume]);

  const startCall = async () => {
    setError("");
    setCallStatus("Requesting microphone...");
    setIsCallPending(true);
    try {
      const stream = await acquireMicrophone();
      const peerConnection = createPeerConnection(stream);
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      if (
        !sendCallSignal("offer", {
          offer: peerConnection.localDescription.toJSON(),
        })
      ) {
        throw new Error("The chat connection is unavailable.");
      }
      setCallStatus("Calling...");
    } catch (callError) {
      cleanupCall();
      setCallStatus("Ready");
      setError(`Could not start audio call: ${callError.message}`);
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) {
      return;
    }

    setError("");
    setCallStatus("Connecting...");
    setIsCallPending(true);
    try {
      const stream = await acquireMicrophone();
      const peerConnection = createPeerConnection(stream);
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer),
      );
      await addPendingCandidates(peerConnection);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      if (
        !sendCallSignal("answer", {
          answer: peerConnection.localDescription.toJSON(),
        })
      ) {
        throw new Error("The chat connection is unavailable.");
      }
      pendingOfferRef.current = false;
      setIncomingCall(null);
    } catch (callError) {
      cleanupCall();
      pendingOfferRef.current = false;
      setIncomingCall(null);
      setCallStatus("Call failed");
      setError(`Could not answer audio call: ${callError.message}`);
    }
  };

  const rejectCall = () => {
    sendCallSignal("reject");
    pendingOfferRef.current = false;
    setIncomingCall(null);
    setCallStatus("Call declined");
  };

  const endCall = () => {
    sendCallSignal("end");
    cleanupCall();
    pendingOfferRef.current = false;
    setIncomingCall(null);
    setCallStatus("Ready");
  };

  const toggleMicrophone = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsMicrophoneEnabled(track.enabled);
    }
  };

  return (
    <section className="relative flex shrink-0 items-center" aria-label="Audio call">
      {incomingCall ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-30 flex w-[min(340px,calc(100vw-32px))] flex-col gap-3 rounded-2xl border border-sky-300/20 bg-slate-950 p-4 text-slate-100 shadow-2xl shadow-black/40 sm:left-auto sm:right-0 sm:top-1/2 sm:w-[min(360px,calc(100vw-32px))] sm:-translate-y-1/2" role="alert">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-700 text-white" aria-hidden="true">
              <PhoneCall size={19} />
            </span>
            <div className="grid gap-1">
              <strong className="text-sm font-semibold">Incoming audio call</strong>
              <span className="text-xs text-slate-400">Your room partner is calling</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 text-sm font-semibold text-white transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-50"
              onClick={acceptCall}
              disabled={!isConnected}
              aria-label="Answer audio call"
              title="Answer"
            >
              <Phone size={18} aria-hidden="true" />
              <span>Answer</span>
            </button>
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-rose-700 px-3 text-sm font-semibold text-white transition hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300"
              onClick={rejectCall}
              aria-label="Decline audio call"
              title="Decline"
            >
              <PhoneOff size={18} aria-hidden="true" />
              <span>Decline</span>
            </button>
          </div>
        </div>
      ) : isCallActive ? (
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="hidden text-xs font-medium tabular-nums text-emerald-300 sm:inline" role="status">
            {Math.floor(callDuration / 60)}:
            {String(callDuration % 60).padStart(2, "0")}
          </span>
          <label className="flex w-20 items-center gap-1 text-slate-300 sm:w-28">
            <Volume2 size={17} aria-hidden="true" className="shrink-0" />
            <input
              className="w-full accent-sky-400"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={remoteVolume}
              onChange={(event) => setRemoteVolume(Number(event.target.value))}
              aria-label="Call speaker volume"
            />
          </label>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              className={`grid h-9 w-9 place-items-center rounded-full text-white transition focus:outline-none focus:ring-2 focus:ring-white/50 sm:h-10 sm:w-10 ${isMicrophoneEnabled ? "bg-slate-700 hover:bg-slate-600" : "bg-amber-700 hover:bg-amber-600"}`}
              onClick={toggleMicrophone}
              aria-label={isMicrophoneEnabled ? "Mute microphone" : "Unmute microphone"}
              title={isMicrophoneEnabled ? "Mute microphone" : "Unmute microphone"}
            >
              {isMicrophoneEnabled ? (
                <Mic size={19} aria-hidden="true" />
              ) : (
                <MicOff size={19} aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full bg-rose-700 text-white transition hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300 sm:h-10 sm:w-10"
              onClick={endCall}
              aria-label="End audio call"
              title="End call"
            >
              <PhoneOff size={19} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : isCallPending ? (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 text-xs text-amber-300 sm:text-sm" role="status">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" aria-hidden="true" />
            {callStatus === "Requesting microphone..."
              ? "Connecting"
              : callStatus}
          </span>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full bg-rose-700 text-white transition hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300 sm:h-10 sm:w-10"
            onClick={endCall}
            aria-label="Cancel audio call"
            title="Cancel call"
          >
            <PhoneOff size={19} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-full border border-emerald-300/20 bg-emerald-900/50 text-emerald-100 transition hover:bg-emerald-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
          onClick={startCall}
          disabled={!isConnected}
          aria-label="Start audio call"
          title="Start audio call"
        >
          <Phone size={19} aria-hidden="true" />
        </button>
      )}

      <audio
        ref={remoteAudioRef}
        className="pointer-events-none absolute h-px w-px opacity-0"
        autoPlay
        playsInline
        aria-label="Remote caller audio"
      />
      {error && (
        <p className="absolute right-0 top-full mt-2 w-max max-w-[min(320px,calc(100vw-24px))] rounded-lg border border-rose-400/20 bg-slate-950 px-3 py-2 text-xs text-rose-300 shadow-xl" role="alert">
          {error}
        </p>
      )}
    </section>
  );
};

export default AudioCall;
