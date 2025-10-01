import { useState, useEffect, useCallback } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  const speak = useCallback((text: string) => {
    if (!synth || !text) return;
    
    // Cancel any ongoing speech before starting a new one
    if (synth.speaking) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance.onerror', event);
      setIsSpeaking(false);
    };
    
    synth.speak(utterance);
  }, [synth]);

  const cancel = useCallback(() => {
    if (!synth) return;
    synth.cancel();
    setIsSpeaking(false);
  }, [synth]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synth && synth.speaking) {
        synth.cancel();
      }
    };
  }, [synth]);

  return { speak, cancel, isSpeaking, isSupported: !!synth };
};
