import React, { useEffect, useState } from "react";
import { useVoiceAssistant } from "../hooks/useVoiceAssistant";

function VoiceAssistantPanel({ onNavigate }) {
  const {
    isListening,
    errorMessage,
    aiReply,
    isPendingResponse,
    startListening,
    stopListening,
  } = useVoiceAssistant(onNavigate);

  const [typedReply, setTypedReply] = useState("");
  const [isReplyTyping, setIsReplyTyping] = useState(false);

  useEffect(() => {
    if (!aiReply) {
      setTypedReply("");
      setIsReplyTyping(false);
      return;
    }

    const text = aiReply.trim();
    let index = 0;
    setTypedReply("");
    setIsReplyTyping(true);

    const interval = window.setInterval(() => {
      index += 1;
      setTypedReply(text.slice(0, index));
      if (index >= text.length) {
        setIsReplyTyping(false);
        window.clearInterval(interval);
      }
    }, 24);

    return () => {
      window.clearInterval(interval);
    };
  }, [aiReply]);

  const isAvatarActive = isListening || isPendingResponse || isReplyTyping;
  const bubbleVisible =
    isListening || isPendingResponse || aiReply || errorMessage;

  return (
    <div
      className="voice-assistant-float"
      role="region"
      aria-label="Floating voice assistant"
    >
      <div
        className={`voice-assistant-bubble ${bubbleVisible ? "visible" : ""}`}
      >
        <p className="voice-assistant-bubble-message">
          {isListening
            ? "Listening..."
            : isPendingResponse
              ? "Thinking..."
              : typedReply || aiReply || "Tap the assistant to speak"}
        </p>
        {errorMessage ? (
          <p className="voice-error bubble-error">{errorMessage}</p>
        ) : null}
        {isListening ? (
          <button
            type="button"
            className="voice-stop-button"
            onClick={stopListening}
          >
            Stop
          </button>
        ) : null}
      </div>

      <button
        type="button"
        className={`voice-avatar-button ${isAvatarActive ? "active" : ""}`}
        onClick={startListening}
        aria-label={
          isListening
            ? "Listening for voice command"
            : "Activate voice assistant"
        }
      >
        {isAvatarActive ? (
          <div className="voice-waveform" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, index) => (
              <span key={index} style={{ "--i": index }} />
            ))}
          </div>
        ) : null}
        <span>AI</span>
      </button>
    </div>
  );
}

export default VoiceAssistantPanel;
