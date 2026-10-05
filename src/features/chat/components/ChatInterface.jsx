import React, { useEffect, useRef, useState } from "react";
import { LogOut, Mic, Video, X } from "lucide-react";
import AudioCall from "./AudioCall";
import VideoChat from "./videoChat/VideoChat";
import { createSignalingServer } from "../services/signaling";

const STORAGE_KEY_PREFIX = "one-to-one-chat:";
const MAX_VOICE_DURATION_SECONDS = 20;
const MAX_VOICE_RECORDING_BYTES = 500 * 1024;
const MAX_VOICE_DATA_URL_LENGTH = 700_000;
const VOICE_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
];

const createMessageId = () =>
  window.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const getStorageKey = (roomId) =>
  `${STORAGE_KEY_PREFIX}${encodeURIComponent(roomId)}`;

const isValidAudioData = (audioData) =>
  typeof audioData === "string" &&
  audioData.startsWith("data:audio/") &&
  audioData.length <= MAX_VOICE_DATA_URL_LENGTH;

const isStoredMessage = (message) =>
  message &&
  typeof message.id === "string" &&
  typeof message.sentAt === "string" &&
  Number.isFinite(Date.parse(message.sentAt)) &&
  (message.sender === "user" || message.sender === "peer") &&
  (message.type === "voice"
    ? isValidAudioData(message.audioData)
    : (message.type === undefined || message.type === "text") &&
      typeof message.text === "string");

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Could not read the voice recording."));
      }
    };
    reader.onerror = () =>
      reject(reader.error || new Error("Could not read the voice recording."));
    reader.readAsDataURL(blob);
  });

const loadMessages = (roomId) => {
  try {
    const stored = window.localStorage.getItem(getStorageKey(roomId));
    if (!stored) {
      return { messages: [], error: "" };
    }

    const messages = JSON.parse(stored);
    if (!Array.isArray(messages) || !messages.every(isStoredMessage)) {
      throw new Error("Stored chat history has an invalid format.");
    }

    return { messages, error: "" };
  } catch (error) {
    return {
      messages: [],
      error: `Could not load saved messages: ${error.message}`,
    };
  }
};

const ChatInterface = () => {
  const [roomDraft, setRoomDraft] = useState("");
  const [activeRoomId, setActiveRoomId] = useState("");
  const [messages, setMessages] = useState([]);
  const [messagesRoomId, setMessagesRoomId] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Enter a room ID");
  const [error, setError] = useState("");
  const [canPersistHistory, setCanPersistHistory] = useState(false);
  const [chatSignaling, setChatSignaling] = useState(null);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [videoCallMode, setVideoCallMode] = useState(null);
  const [videoCallNotification, setVideoCallNotification] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const signalingRef = useRef(null);
  const messagesRef = useRef([]);
  const messagesContainerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingStreamRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const recordingTimeoutRef = useRef(null);
  const discardRecordingRef = useRef(false);
  const videoCallNotificationTimeoutRef = useRef(null);

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  useEffect(
    () => () => {
      window.clearInterval(recordingIntervalRef.current);
      window.clearTimeout(recordingTimeoutRef.current);
      window.clearTimeout(videoCallNotificationTimeoutRef.current);
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  useEffect(() => {
    if (!activeRoomId) {
      return undefined;
    }

    const signaling = createSignalingServer();
    signalingRef.current = signaling;
    setChatSignaling(signaling);
    setIsConnected(false);
    setConnectionStatus("Connecting...");

    const unsubscribe = signaling.onMessage((event) => {
      if (event.type === "room-joined") {
        if (event.roomId && event.roomId !== activeRoomId) {
          setError("The server joined a different room.");
          return;
        }

        setIsConnected(true);
        setConnectionStatus("Connected");
        setError((currentError) =>
          currentError.startsWith("Could not connect to chat") ? "" : currentError,
        );
        return;
      }

      if (event.type === "disconnected") {
        setIsConnected(false);
        setConnectionStatus("Disconnected");
        return;
      }

      if (event.type === "connection-error") {
        setIsConnected(false);
        setConnectionStatus("Connection failed");
        setError(
          `Could not connect to chat: ${event.error?.message || "unknown error"}`,
        );
        return;
      }

      if (event.type === "video-call-request") {
        if (
          event.roomId === activeRoomId &&
          event.from !== signaling.getSocketId()
        ) {
          setVideoCallNotification(true);
          window.clearTimeout(videoCallNotificationTimeoutRef.current);
          videoCallNotificationTimeoutRef.current = window.setTimeout(
            () => setVideoCallNotification(false),
            10_000,
          );
          setVideoCallMode("receiver");
          setIsVideoCallOpen(true);
        }
        return;
      }

      if (event.type !== "chat-message") {
        return;
      }

      const received = event.message;
      if (
        event.roomId !== activeRoomId ||
        !received ||
        typeof received.id !== "string" ||
        typeof received.text !== "string" ||
        typeof received.sentAt !== "string" ||
        !Number.isFinite(Date.parse(received.sentAt)) ||
        typeof received.senderId !== "string" ||
        (received.type !== undefined &&
          received.type !== "text" &&
          received.type !== "voice") ||
        (received.type === "voice" && !isValidAudioData(received.audioData))
      ) {
        setError("Received an invalid chat message.");
        return;
      }

      if (received.senderId === signaling.getSocketId()) {
        return;
      }

      const incomingMessage = {
        id: received.id,
        type: received.type ?? "text",
        text: received.text,
        ...(received.type === "voice" ? { audioData: received.audioData } : {}),
        sentAt: received.sentAt,
        sender: "peer",
      };
      messagesRef.current = [...messagesRef.current, incomingMessage];
      setMessages(messagesRef.current);
    });

    try {
      signaling.connect(activeRoomId);
    } catch (connectionError) {
      setConnectionStatus("Connection failed");
      setError(`Could not connect to chat: ${connectionError.message}`);
    }

    return () => {
      unsubscribe();
      signaling.disconnect();
      if (signalingRef.current === signaling) {
        signalingRef.current = null;
        setChatSignaling(null);
      }
    };
  }, [activeRoomId]);

  useEffect(() => {
    if (!messagesRoomId || !canPersistHistory) {
      return;
    }

    try {
      window.localStorage.setItem(
        getStorageKey(messagesRoomId),
        JSON.stringify(messages),
      );
      setError((currentError) =>
        currentError.startsWith("Could not save") ? "" : currentError,
      );
    } catch (storageError) {
      setCanPersistHistory(false);
      setError(`Could not save chat history: ${storageError.message}`);
    }
  }, [canPersistHistory, messages, messagesRoomId]);

  const joinRoom = (event) => {
    event.preventDefault();
    const roomId = roomDraft.trim();
    if (!roomId) {
      return;
    }

    const history = loadMessages(roomId);
    messagesRef.current = history.messages;
    setMessages(history.messages);
    setMessagesRoomId(roomId);
    setCanPersistHistory(!history.error);
    setActiveRoomId(roomId);
    setConnectionStatus("Connecting...");
    setError(history.error);
  };

  const stopVoiceRecording = () => {
    window.clearInterval(recordingIntervalRef.current);
    window.clearTimeout(recordingTimeoutRef.current);
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelVoiceRecording = () => {
    discardRecordingRef.current = true;
    stopVoiceRecording();
    if (!mediaRecorderRef.current) {
      recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
      recordingStreamRef.current = null;
      setIsRecordingVoice(false);
      setRecordingSeconds(0);
    }
  };

  const leaveRoom = () => {
    cancelVoiceRecording();
    setIsVideoCallOpen(false);
    setVideoCallMode(null);
    setVideoCallNotification(false);
    window.clearTimeout(videoCallNotificationTimeoutRef.current);
    setActiveRoomId("");
    setMessages([]);
    messagesRef.current = [];
    setMessagesRoomId("");
    setCanPersistHistory(false);
    setIsConnected(false);
    setConnectionStatus("Enter a room ID");
    setError("");
  };

  const startVideoCall = () => {
    if (!isConnected || !signalingRef.current) {
      setError("Connect to the room before starting a video call.");
      return;
    }

    if (!signalingRef.current.sendMessage({ type: "video-call-request" })) {
      setError("Could not notify your room partner about the video call.");
      return;
    }

    setError("");
    setVideoCallNotification(false);
    setVideoCallMode("caller");
    setIsVideoCallOpen(true);
  };

  const dismissVideoCallNotification = () => {
    setVideoCallNotification(false);
    window.clearTimeout(videoCallNotificationTimeoutRef.current);
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = newMessage.trim();
    const signaling = signalingRef.current;
    const senderId = signaling?.getSocketId();

    if (!text || !isConnected || !senderId || !activeRoomId) {
      return;
    }

    const sentAt = new Date().toISOString();
    const message = {
      id: createMessageId(),
      type: "text",
      text,
      sentAt,
      senderId,
    };

    const result = await signaling.sendMessage({
      type: "chat-message",
      message,
    });
    if (!result?.ok) {
      setError(`Message was not sent: ${result?.error || "chat is disconnected."}`);
      return;
    }

    const outgoingMessage = {
      id: message.id,
      text: message.text,
      sentAt: message.sentAt,
      sender: "user",
    };
    messagesRef.current = [...messagesRef.current, outgoingMessage];
    setMessages(messagesRef.current);
    setNewMessage("");
  };

  const startVoiceRecording = async () => {
    if (!isConnected || !activeRoomId) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError("Voice recording is not supported by this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;

      const mimeType = VOICE_MIME_TYPES.find(
        (type) => window.MediaRecorder.isTypeSupported?.(type),
      );
      const recorder = mimeType
        ? new window.MediaRecorder(stream, { mimeType })
        : new window.MediaRecorder(stream);

      recordingChunksRef.current = [];
      discardRecordingRef.current = false;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };
      recorder.onerror = () => {
        setError("Voice recording failed. Please try again.");
      };
      recorder.onstop = async () => {
        window.clearInterval(recordingIntervalRef.current);
        window.clearTimeout(recordingTimeoutRef.current);
        recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
        recordingStreamRef.current = null;
        mediaRecorderRef.current = null;
        setIsRecordingVoice(false);
        setRecordingSeconds(0);

        if (discardRecordingRef.current) {
          recordingChunksRef.current = [];
          return;
        }

        const blob = new Blob(recordingChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        recordingChunksRef.current = [];

        if (!blob.size) {
          setError("No audio was recorded.");
          return;
        }
        if (blob.size > MAX_VOICE_RECORDING_BYTES) {
          setError("Voice recording is too large to send. Please try again.");
          return;
        }

        try {
          const audioData = await blobToDataUrl(blob);
          const signaling = signalingRef.current;
          const senderId = signaling?.getSocketId();
          if (!signaling || !senderId || !isConnected || !activeRoomId) {
            setError("Voice message was not sent because the chat disconnected.");
            return;
          }

          const message = {
            id: createMessageId(),
            type: "voice",
            text: "Voice message",
            audioData,
            sentAt: new Date().toISOString(),
            senderId,
          };

          const result = await signaling.sendMessage({
            type: "chat-message",
            message,
          });
          if (!result?.ok) {
            setError(
              `Voice message was not sent: ${result?.error || "chat is disconnected."}`,
            );
            return;
          }

          const outgoingMessage = {
            id: message.id,
            type: message.type,
            text: message.text,
            audioData: message.audioData,
            sentAt: message.sentAt,
            sender: "user",
          };
          messagesRef.current = [...messagesRef.current, outgoingMessage];
          setMessages(messagesRef.current);
          setError("");
        } catch (recordingError) {
          setError(`Could not prepare voice message: ${recordingError.message}`);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingVoice(true);
      setRecordingSeconds(0);
      setError("");
      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((seconds) => seconds + 1);
      }, 1000);
      recordingTimeoutRef.current = window.setTimeout(
        stopVoiceRecording,
        MAX_VOICE_DURATION_SECONDS * 1000,
      );
    } catch (recordingError) {
      recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
      recordingStreamRef.current = null;
      setError(`Could not start voice recording: ${recordingError.message}`);
    }
  };

  const formatRecordingTime = (seconds) =>
    `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <section className="mx-auto flex h-[min(76vh,780px)] min-h-[520px] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/90 shadow-2xl shadow-black/20 max-[768px]:h-[calc(100dvh-220px)] max-[768px]:min-h-[360px] max-[480px]:h-[calc(100dvh-190px)] max-[480px]:min-h-[340px] max-[480px]:rounded-xl">
      <header className="relative flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
        <h2
          className="min-w-0 truncate text-base font-semibold text-slate-100 sm:text-lg"
          title={activeRoomId || "One-to-one Chat"}
        >
          {activeRoomId || "💬 One-to-one Chat"}
        </h2>
        {activeRoomId && (
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <AudioCall
              roomId={activeRoomId}
              signaling={chatSignaling}
              isConnected={isConnected}
            />
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sky-300/20 bg-sky-900/50 text-sky-100 transition hover:bg-sky-800/80 focus:outline-none focus:ring-2 focus:ring-sky-300/70 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
              onClick={startVideoCall}
              disabled={!isConnected}
              aria-label="Open video call"
              title="Start or join a video call"
            >
              <Video size={18} aria-hidden="true" />
            </button>
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center ${isConnected ? "text-emerald-400" : "text-slate-500"}`}
              role="status"
              aria-label={connectionStatus}
              title={connectionStatus}
            >
              <span
                className={`h-2 w-2 rounded-full bg-current ${isConnected ? "shadow-[0_0_10px_rgba(52,211,153,0.6)]" : ""}`}
                aria-hidden="true"
              />
            </span>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-500/20 bg-slate-700/40 text-slate-300 transition hover:border-rose-300/30 hover:bg-rose-900/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-300/60 sm:h-10 sm:w-10"
              onClick={leaveRoom}
              aria-label="Leave chat"
              title="Leave chat"
            >
              <LogOut size={17} aria-hidden="true" />
            </button>
          </div>
        )}
      </header>

      {activeRoomId && videoCallNotification && (
        <div className="fixed right-3 top-3 z-[1200] flex w-[min(440px,calc(100vw-24px))] items-center gap-2.5 rounded-xl border border-sky-300/25 bg-slate-950/95 p-3 text-slate-100 shadow-2xl shadow-black/40 sm:right-5 sm:top-5 sm:gap-3 sm:p-4" role="status" aria-live="assertive">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sky-800 text-sky-100 sm:h-11 sm:w-11" aria-hidden="true">
            <Video size={20} />
          </span>
          <span className="grid min-w-0 flex-1 gap-1">
            <strong className="text-sm font-semibold">Incoming video call</strong>
            <span className="truncate text-xs text-slate-400">Your room partner is calling</span>
          </span>
          <button
            type="button"
            className="min-h-9 shrink-0 rounded-lg bg-sky-700 px-2.5 text-xs font-semibold text-white transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-300 sm:px-3 sm:text-sm"
            onClick={() => {
              setVideoCallMode("receiver");
              setIsVideoCallOpen(true);
              dismissVideoCallNotification();
            }}
          >
            Open call
          </button>
          <button
            type="button"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-500/20 bg-slate-800 text-slate-300 transition hover:bg-rose-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-300/60"
            onClick={dismissVideoCallNotification}
            aria-label="Dismiss incoming video call notification"
            title="Dismiss notification"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {activeRoomId && isVideoCallOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/85 p-2 backdrop-blur-md sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Video call in room ${activeRoomId}`}
        >
          <div className="relative max-h-[calc(100dvh-16px)] w-full max-w-6xl overflow-auto sm:max-h-[calc(100dvh-48px)]">
            <button
              type="button"
              className="sticky top-2 z-[60] float-right mr-2 -mb-12 mt-2 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-slate-950/90 text-slate-100 shadow-lg transition hover:bg-rose-800 focus:outline-none focus:ring-2 focus:ring-white/60"
              onClick={() => setIsVideoCallOpen(false)}
              aria-label="Close video call"
              title="Close video call"
            >
              <X size={20} aria-hidden="true" />
            </button>
            <VideoChat
              roomId={activeRoomId}
              autoCallMode={videoCallMode}
              onCallEnd={() => {
                setIsVideoCallOpen(false);
                setVideoCallMode(null);
                setVideoCallNotification(false);
              }}
            />
          </div>
        </div>
      )}

      {!activeRoomId ? (
        <>
          <form
            className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-2.5 px-4 pt-5 sm:gap-x-3 sm:px-6 sm:pt-6"
            onSubmit={joinRoom}
          >
            <label
              htmlFor="chat-room-id"
              className="col-span-2 justify-self-start text-sm font-semibold text-slate-200"
            >
              Room ID
            </label>
            <input
              id="chat-room-id"
              type="text"
              className="col-start-1 row-start-2 min-h-11 w-full min-w-0 rounded-xl border border-slate-600 bg-slate-950/60 px-3.5 py-3 text-slate-100 caret-sky-300 outline-none placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
              value={roomDraft}
              onChange={(event) => setRoomDraft(event.target.value)}
              placeholder="Enter the shared room ID"
              autoComplete="off"
              required
            />
            <button
              type="submit"
              className="col-start-2 row-start-2 min-h-11 rounded-xl bg-sky-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!roomDraft.trim()}
            >
              Join chat
            </button>
          </form>
          <aside className="mx-4 mb-5 mt-1 rounded-xl border border-slate-700/70 bg-slate-800/35 p-4 sm:mx-6 sm:mb-6 sm:p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-200">
              How to connect
            </h3>
            <ol className="grid gap-3 text-sm leading-relaxed text-slate-400 sm:grid-cols-3 sm:gap-4">
              <li className="flex items-start gap-2.5">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky-900/70 text-xs font-semibold text-sky-200">
                  1
                </span>
                <span>Share a room ID with the person you want to chat with.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky-900/70 text-xs font-semibold text-sky-200">
                  2
                </span>
                <span>Both of you enter the exact same ID and select Join chat.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sky-900/70 text-xs font-semibold text-sky-200">
                  3
                </span>
                <span>Once connected, send messages or start an audio or video call.</span>
              </li>
            </ol>
          </aside>
        </>
      ) : (
        <>
          <div
            ref={messagesContainerRef}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-slate-950/35 p-3 sm:p-5"
            aria-live="polite"
          >
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
                <div className="mb-3 text-4xl opacity-60">💬</div>
                <p className="text-sm">Start a conversation...</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-2.5 flex w-fit max-w-[86%] flex-col break-words rounded-[18px] border px-3.5 py-2.5 text-left shadow-sm sm:max-w-[72%] ${
                    message.sender === "user"
                      ? "ml-auto rounded-br-md border-sky-300/20 bg-cyan-800 text-slate-50"
                      : "mr-auto rounded-bl-md border-slate-300/10 bg-slate-800 text-slate-100"
                  }`}
                >
                  {message.type === "voice" ? (
                    <audio
                      className="block h-10 w-[min(280px,calc(100vw-120px))] min-w-0 max-w-full [color-scheme:dark]"
                      controls
                      preload="none"
                      src={message.audioData}
                      aria-label="Voice message"
                    />
                  ) : (
                    <div className="mb-1 whitespace-pre-wrap break-words text-left leading-relaxed">
                      {message.text}
                    </div>
                  )}
                  <div className="text-right text-[0.68rem] leading-none text-slate-300/65">
                    {new Date(message.sentAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          <form
            className={`grid shrink-0 grid-cols-[minmax(0,1fr)_44px_44px] items-center gap-2 border-t border-white/10 p-2.5 sm:flex sm:p-4 ${
              isRecordingVoice ? "grid-cols-[minmax(0,1fr)_minmax(76px,auto)_minmax(72px,auto)]" : ""
            }`}
            onSubmit={sendMessage}
          >
            <input
              type="text"
              value={newMessage}
              className={`col-start-1 row-start-1 min-h-11 w-full min-w-0 rounded-xl border border-slate-600 bg-slate-950/60 px-3 py-2.5 text-slate-100 caret-sky-300 outline-none placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 sm:flex-1 ${
                isRecordingVoice ? "col-span-3" : ""
              }`}
              onChange={(event) => setNewMessage(event.target.value)}
              placeholder={
                isConnected ? "Type a message..." : "Connecting to chat..."
              }
              aria-label="Message"
              disabled={!isConnected}
            />
            <button
              type="submit"
              className={`min-h-11 rounded-xl bg-sky-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-45 max-[480px]:col-start-2 max-[480px]:row-start-1 ${
                isRecordingVoice ? "max-[480px]:row-start-3" : ""
              }`}
              disabled={!isConnected || !newMessage.trim()}
              aria-label="Send message"
              title="Send message"
            >
              Send
            </button>
            {!isRecordingVoice ? (
              <button
                type="button"
                onClick={startVoiceRecording}
                disabled={!isConnected}
                className="col-start-3 row-start-1 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-600 bg-slate-800 text-slate-100 transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-45 max-[480px]:col-start-3 max-[480px]:row-start-1"
                aria-label="Record voice message"
                title="Record voice message"
              >
                <Mic size={18} aria-hidden="true" />
              </button>
            ) : (
              <>
                <span className="col-span-3 row-start-2 text-xs text-rose-300" role="status">
                  Recording {formatRecordingTime(recordingSeconds)} / 0:20
                </span>
                <button type="button" className="row-start-3 rounded-lg bg-rose-700 px-2 py-2 text-xs font-semibold text-white hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300" onClick={stopVoiceRecording}>
                  Stop &amp; send
                </button>
                <button type="button" className="row-start-3 rounded-lg border border-slate-600 bg-slate-800 px-2 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300" onClick={cancelVoiceRecording}>
                  Cancel
                </button>
              </>
            )}
          </form>
        </>
      )}

      {error && (
        <p className="shrink-0 px-4 pb-4 text-sm text-rose-300" role="alert">
          {error}
        </p>
      )}
    </section>
  );
};

export default ChatInterface;
