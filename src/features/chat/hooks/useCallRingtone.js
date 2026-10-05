import { useCallback, useEffect, useRef } from "react";

// Configuration constants for better maintainability
const CONFIG = {
  RING_INTERVAL_MS: 3000,
  TONE_DURATION: 0.48,
  ATTACK_TIME: 0.025,
  HOLD_TIME: 0.1,
  MAX_GAIN: 0.075,
  INITIAL_GAIN: 0.0001,
  FREQUENCIES: [440, 480],
  PULSE_OFFSETS: [0, 0.5, 1, 1.5],
};

/**
 * Custom hook that plays a call ringtone using the Web Audio API
 * @param {boolean} isRinging - Whether the ringtone should be playing
 * @param {Object} options - Optional configuration overrides
 */
const useCallRingtone = (isRinging, options = {}) => {
  const {
    intervalMs = CONFIG.RING_INTERVAL_MS,
    respectPreferences = true,
  } = options;

  // Use refs to avoid recreating audio context on re-renders
  const audioContextRef = useRef(null);
  const intervalIdRef = useRef(null);
  const isDisposedRef = useRef(false);
  const oscillatorsRef = useRef(new Set());

  const initializeAudio = useCallback(() => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error("Web Audio API not supported");
    }
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
      isDisposedRef.current = false;
    }
  }, []);

  const resumeAudioContext = useCallback(async () => {
    const audioContext = audioContextRef.current;
    if (audioContext && audioContext.state === "suspended") {
      await audioContext.resume();
    }
  }, []);

  const playTone = useCallback(
    (frequency, startTime, duration = CONFIG.TONE_DURATION) => {
      if (isDisposedRef.current) return;

      try {
        const audioContext = audioContextRef.current;
        if (!audioContext || audioContext.state !== "running") return;

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, startTime);

        const { INITIAL_GAIN, MAX_GAIN, ATTACK_TIME, HOLD_TIME } = CONFIG;

        gain.gain.setValueAtTime(INITIAL_GAIN, startTime);
        gain.gain.exponentialRampToValueAtTime(
          MAX_GAIN,
          startTime + ATTACK_TIME,
        );
        gain.gain.setValueAtTime(MAX_GAIN, startTime + HOLD_TIME);
        gain.gain.exponentialRampToValueAtTime(
          INITIAL_GAIN,
          startTime + duration,
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration + 0.01);

        oscillatorsRef.current.add(oscillator);

        oscillator.onended = () => {
          oscillatorsRef.current.delete(oscillator);
          try {
            oscillator.disconnect();
            gain.disconnect();
          } catch (error) {
            console.warn("Failed to disconnect ringtone audio nodes:", error);
          }
        };
      } catch (error) {
        console.error("Failed to play tone:", error);
      }
    },
    [],
  );

  const playRing = useCallback(() => {
    if (isDisposedRef.current) return;

    const audioContext = audioContextRef.current;
    if (!audioContext || audioContext.state !== "running") return;

    const now = audioContext.currentTime;
    const { FREQUENCIES, PULSE_OFFSETS } = CONFIG;

    PULSE_OFFSETS.forEach((pulseOffset) => {
      FREQUENCIES.forEach((frequency) => {
        playTone(frequency, now + pulseOffset);
      });
    });
  }, [playTone]);

  const startRinging = useCallback(() => {
    playRing();
    intervalIdRef.current = window.setInterval(() => {
      if (!isDisposedRef.current) playRing();
    }, intervalMs);
  }, [intervalMs, playRing]);

  const cleanup = useCallback(() => {
    isDisposedRef.current = true;

    if (intervalIdRef.current) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    oscillatorsRef.current.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch (e) {}
    });
    oscillatorsRef.current.clear();

    const audioContext = audioContextRef.current;
    if (audioContext && audioContext.state !== "closed") {
      audioContext
        .close()
        .then(() => {
          audioContextRef.current = null;
        })
        .catch((error) => {
          console.warn("Error closing audio context:", error);
          audioContextRef.current = null;
        });
    }
  }, []);

  useEffect(() => {
    if (
      respectPreferences &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      console.info("Call ringtone disabled due to reduced motion preference");
      cleanup();
      return undefined;
    }

    if (!isRinging) {
      cleanup();
      return undefined;
    }

    try {
      initializeAudio();
      resumeAudioContext()
        .then(() => {
          if (!isDisposedRef.current) startRinging();
        })
        .catch((error) => {
          console.warn("Audio requires user interaction:", error.message);
        });
    } catch (error) {
      console.error("Failed to initialize audio:", error);
      cleanup();
    }

    return cleanup;
  }, [
    cleanup,
    initializeAudio,
    isRinging,
    respectPreferences,
    resumeAudioContext,
    startRinging,
  ]);
};

export default useCallRingtone;
