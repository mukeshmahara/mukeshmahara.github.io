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
  const voiceRef = useRef(null);
  const manualStopRef = useRef(false);

  const supported = useMemo(() => isSpeechSupported(), []);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return undefined;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) {
        return;
      }

      const preferredVoice =
        voices.find((voice) =>
          /Google US English|Microsoft David|Microsoft Zira|Samantha|Daniel|Alloy/i.test(
            voice.name,
          ),
        ) ||
        voices.find((voice) => voice.lang?.startsWith("en")) ||
        voices[0];

      voiceRef.current = preferredVoice;
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

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
    utterance.volume = 1;
    utterance.rate = 1.02;
    utterance.pitch = 1;
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopListening = useCallback(() => {
    manualStopRef.current = true;
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

    manualStopRef.current = false;
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
    recognition.continuous = true;
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
      if (manualStopRef.current) {
        setStatusMessage("Voice assistant paused");
        return;
      }

      setStatusMessage("Restarting listening...");
      try {
        recognition.start();
      } catch (error) {
        setErrorMessage("Unable to restart listening automatically.");
        setStatusMessage("Voice assistant paused");
      }
    };

    recognition.onresult = async (event) => {
      const transcript = Array.from(event.results)
        .slice(event.resultIndex)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      if (!transcript) {
        return;
      }

      const normalized = transcript.toLowerCase().trim();
      const isStopCommand = /\bstop(?: listening)?\b/.test(normalized);
      if (isStopCommand) {
        manualStopRef.current = true;
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        setLastTranscript(transcript);
        setIsListening(false);
        setStatusMessage("Listening stopped");
        setAiReply("Okay, I stopped listening.");
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
    if (!supported) {
      return;
    }

    manualStopRef.current = false;
    startListening();
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
