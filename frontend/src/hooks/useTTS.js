import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Wraps the Web Speech API SpeechSynthesis interface with play/pause/stop,
 * speed control (0.5x-2.0x), and boundary tracking for read-along highlighting.
 */
export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [supported, setSupported] = useState(true);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
    }
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(
    (text) => {
      if (!supported || !text) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentCharIndex(0);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      utterance.onboundary = (e) => setCurrentCharIndex(e.charIndex);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [rate, supported]
  );

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentCharIndex(0);
  }, [supported]);

  const changeRate = useCallback(
    (newRate, text) => {
      setRate(newRate);
      // Restart speech at the new rate if currently active, so the change is audible immediately.
      if (isSpeaking && text) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = newRate;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }
    },
    [isSpeaking]
  );

  return {
    supported,
    isSpeaking,
    isPaused,
    rate,
    currentCharIndex,
    speak,
    pause,
    resume,
    stop,
    setRate: changeRate,
  };
}
