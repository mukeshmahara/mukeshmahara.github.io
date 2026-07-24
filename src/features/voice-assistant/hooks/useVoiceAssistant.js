import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getOllamaResponse,
  isSpeechSupported,
} from "../services/speechService";

export function useVoiceAssistant(onNavigate) {
  const [isListening, setIsListening] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Voice assistant ready");
  const [errorMessage, setErrorMessage] = useState("");
  const [lastTranscript, setLastTranscript] = useState("");
  const [aiReply, setAiReply] = useState("");
  const recognitionRef = useRef(null);

  const supported = useMemo(() => isSpeechSupported(), []);

  const speakReply = useCallback((text) => {
    if (
      !text ||
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setStatusMessage("Voice assistant paused");
  }, []);

  const startListening = useCallback(() => {
    if (!supported) {
      setErrorMessage("Speech recognition is not supported in this browser");
      return;
    }

    const recognition = recognitionRef.current;
    if (!recognition) {
      setErrorMessage("Voice recognition is not initialized yet.");
      return;
    }

    try {
      recognition.start();
    } catch (error) {
      setErrorMessage("Unable to start the microphone right now.");
    }
  }, [supported]);

  useEffect(() => {
    if (!supported) {
      setStatusMessage("Speech recognition is not supported in this browser");
      return undefined;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setStatusMessage("Listening...");
      setErrorMessage("");
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setErrorMessage(`Speech error: ${event.error}`);
      setStatusMessage("Voice assistant unavailable");
    };

    recognition.onend = () => {
      setIsListening(false);
      setStatusMessage("Voice assistant ready");
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          setErrorMessage("Unable to restart listening automatically.");
        }
      }
    };

    recognition.onresult = async (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      if (!transcript) {
        return;
      }

      setLastTranscript(transcript);
      setStatusMessage("Thinking...");

      try {
        const reply = await getOllamaResponse(transcript);
        setAiReply(reply);
        speakReply(reply);
        setStatusMessage("Response ready");
      } catch (err) {
        setErrorMessage(
          "Could not reach Ollama. Make sure it is running locally.",
        );
        setStatusMessage("Response failed");
      }
    };

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [supported, onNavigate, speakReply]);

  useEffect(() => {
    if (supported) {
      startListening();
    }
  }, [supported, startListening]);

  return {
    isListening,
    statusMessage,
    errorMessage,
    lastTranscript,
    aiReply,
    startListening,
    stopListening,
  };
}
