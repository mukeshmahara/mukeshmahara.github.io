import React, { useEffect, useState } from "react";
import { useVoiceAssistant } from "../hooks/useVoiceAssistant";

function VoiceAssistantPanel({ onNavigate }) {
  const {
    isListening,
    statusMessage,
    errorMessage,
    lastTranscript,
    aiReply,
    isPendingResponse,
    startListening,
    stopListening,
  } = useVoiceAssistant(onNavigate);

  const [typedTranscript, setTypedTranscript] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typedReply, setTypedReply] = useState("");
  const [isReplyTyping, setIsReplyTyping] = useState(false);

  useEffect(() => {
    if (!lastTranscript) {
      setTypedTranscript("");
      setIsTyping(false);
      return;
    }

    const text = `You: ${lastTranscript}`;
    let index = 0;
    setTypedTranscript("");
    setIsTyping(true);

    const interval = window.setInterval(() => {
      index += 1;
      setTypedTranscript(text.slice(0, index));
      if (index >= text.length) {
        setIsTyping(false);
        window.clearInterval(interval);
      }
    }, 30);

    return () => {
      window.clearInterval(interval);
    };
  }, [lastTranscript]);

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

  return (
    <div
      className="voice-assistant-panel"
      role="region"
      aria-label="AI assistant"
    >
      <div className="voice-assistant-header">
        <h3>AI Assistant</h3>
        <div
          className={`voice-avatar ${isListening ? "listening" : ""}`}
          aria-label={isListening ? "Listening" : "Assistant idle"}
        >
          <span>AI</span>
        </div>
      </div>
      <p className="voice-status">{statusMessage}</p>
      <p className={`voice-transcript ${isTyping ? "typing" : ""}`}>
        {typedTranscript || "No speech captured yet."}
      </p>
      {isPendingResponse ? (
        <div className="voice-skeleton">
          <div className="voice-skeleton-line short" />
          <div className="voice-skeleton-line" />
          <div className="voice-skeleton-line long" />
        </div>
      ) : aiReply ? (
        <p className={`voice-reply ${isReplyTyping ? "typing" : ""}`}>
          {typedReply || aiReply}
        </p>
      ) : null}
      {errorMessage ? <p className="voice-error">{errorMessage}</p> : null}
      <div className="voice-actions">
        <button type="button" onClick={startListening}>
          {isListening ? "Listening..." : "Start Voice"}
        </button>
        <button type="button" onClick={stopListening}>
          Stop
        </button>
      </div>
      <p className="voice-hint">
        Try saying “go to projects” or “show me my experience”.
      </p>
    </div>
  );
}

export default VoiceAssistantPanel;
