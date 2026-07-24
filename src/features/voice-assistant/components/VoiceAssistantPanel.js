import React from "react";
import { useVoiceAssistant } from "../hooks/useVoiceAssistant";

function VoiceAssistantPanel({ onNavigate }) {
  const {
    isListening,
    statusMessage,
    errorMessage,
    lastTranscript,
    aiReply,
    startListening,
    stopListening,
  } = useVoiceAssistant(onNavigate);

  return (
    <div
      className="voice-assistant-panel"
      role="region"
      aria-label="Voice assistant"
    >
      <div className="voice-assistant-header">
        <h3>Voice Assistant</h3>
        <span className={`voice-dot ${isListening ? "listening" : ""}`} />
      </div>
      <p className="voice-status">{statusMessage}</p>
      <p className="voice-transcript">
        {lastTranscript ? `You: ${lastTranscript}` : "No speech captured yet."}
      </p>
      {aiReply ? <p className="voice-reply">{aiReply}</p> : null}
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
