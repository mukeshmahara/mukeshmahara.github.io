import React, { useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";
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
    setActiveRoomId("");
    setMessages([]);
    messagesRef.current = [];
    setMessagesRoomId("");
    setCanPersistHistory(false);
    setIsConnected(false);
    setConnectionStatus("Enter a room ID");
    setError("");
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
    <div className="chat-interface-container project-card">
      <div className="chat-interface-header">
        <h3>💬 One-to-one Chat</h3>
        <span
          className={`chat-status ${isConnected ? "is-connected" : "is-offline"}`}
          role="status"
        >
          {connectionStatus}
        </span>
      </div>

      {!activeRoomId ? (
        <form className="chat-room-form" onSubmit={joinRoom}>
          <label htmlFor="chat-room-id">Room ID</label>
          <input
            id="chat-room-id"
            type="text"
            value={roomDraft}
            onChange={(event) => setRoomDraft(event.target.value)}
            placeholder="Enter the shared room ID"
            autoComplete="off"
            required
          />
          <button type="submit" disabled={!roomDraft.trim()}>
            Join chat
          </button>
          <p>Both participants must enter the same room ID.</p>
        </form>
      ) : (
        <>
          <div className="chat-room-details">
            <span>
              Room: <strong>{activeRoomId}</strong>
            </span>
            <button type="button" onClick={leaveRoom}>
              Leave chat
            </button>
          </div>

          <div
            ref={messagesContainerRef}
            className="messages-container"
            aria-live="polite"
          >
            {messages.length === 0 ? (
              <div className="no-messages">
                <div className="chat-icon">💬</div>
                <p>Start a conversation...</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-bubble ${
                    message.sender === "user" ? "user-message" : "bot-message"
                  }`}
                >
                  {message.type === "voice" ? (
                    <audio
                      className="voice-message-player"
                      controls
                      preload="none"
                      src={message.audioData}
                      aria-label="Voice message"
                    />
                  ) : (
                    <div className="message-content">{message.text}</div>
                  )}
                  <div className="message-timestamp">
                    {new Date(message.sentAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          <form className="chat-message-form" onSubmit={sendMessage}>
            <input
              type="text"
              value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)}
              placeholder={
                isConnected ? "Type a message..." : "Connecting to chat..."
              }
              aria-label="Message"
              disabled={!isConnected}
            />
            <button
              type="submit"
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
                className="voice-record-button"
                aria-label="Record voice message"
                title="Record voice message"
              >
                <Mic size={18} aria-hidden="true" />
              </button>
            ) : (
              <>
                <span className="voice-recording-status" role="status">
                  Recording {formatRecordingTime(recordingSeconds)} / 0:20
                </span>
                <button type="button" onClick={stopVoiceRecording}>
                  Stop &amp; send
                </button>
                <button type="button" onClick={cancelVoiceRecording}>
                  Cancel
                </button>
              </>
            )}
          </form>
        </>
      )}

      {error && (
        <p className="chat-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default ChatInterface;
