
import { useState, useEffect, useRef, useCallback } from 'react';
import { SpeechCommand } from '../types';

// Add type declarations for SpeechRecognition API to resolve TypeScript errors
// if 'dom' lib is not included in tsconfig.json or the environment.
declare global {
  // Define the interface for a SpeechRecognition instance
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;

    start(): void;
    stop(): void;
    abort(): void;

    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  }

  // Define the constructor interface for SpeechRecognition
  interface SpeechRecognitionConstructor {
    new(): SpeechRecognition;
    prototype: SpeechRecognition;
  }

  // Extend the Window interface to include the SpeechRecognition constructor
  interface Window {
    // Use the constructor type defined above
    SpeechRecognition: SpeechRecognitionConstructor;
    // Use the constructor type defined above
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: SpeechRecognitionErrorCode;
    readonly message: string;
  }

  type SpeechRecognitionErrorCode =
    | 'no-speech'
    | 'aborted'
    | 'audio-capture'
    | 'network'
    | 'not-allowed'
    | 'service-not-allowed'
    | 'bad-grammar'
    | 'language-not-supported';
}

interface UseSpeechRecognitionProps {
  onCommand: (command: SpeechCommand) => void;
  isEnabled: boolean;
}

interface SpeechRecognitionState {
  isListening: boolean;
  recognitionError: string | null;
  lastTranscript: string | null;
}

const useSpeechRecognition = ({ onCommand, isEnabled }: UseSpeechRecognitionProps) => {
  const [state, setState] = useState<SpeechRecognitionState>({
    isListening: false,
    recognitionError: null,
    lastTranscript: null,
  });
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const setupRecognition = useCallback(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // Renames the local `SpeechRecognition` constant to `SpeechRecognitionConstructor` to avoid a name collision with the global type `SpeechRecognition`.
      // The `Window` interface now correctly defines `SpeechRecognition` as `SpeechRecognitionConstructor`.
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionConstructor();

      recognition.continuous = true; // Keep listening
      recognition.interimResults = false; // Only return final results
      recognition.lang = 'en-US'; // Set language

      recognition.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, recognitionError: null }));
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.toLowerCase().trim();
        setState(prev => ({ ...prev, lastTranscript: transcript }));
        console.log('Voice command:', transcript);

        if (transcript.includes(SpeechCommand.SCROLL_UP)) {
          onCommand(SpeechCommand.SCROLL_UP);
        } else if (transcript.includes(SpeechCommand.SCROLL_DOWN)) {
          onCommand(SpeechCommand.SCROLL_DOWN);
        } else if (transcript.includes(SpeechCommand.PAUSE)) {
          onCommand(SpeechCommand.PAUSE);
        } else if (transcript.includes(SpeechCommand.RESUME)) {
          onCommand(SpeechCommand.RESUME);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setState(prev => ({ ...prev, isListening: false, recognitionError: event.error }));
      };

      recognition.onend = () => {
        setState(prev => ({ ...prev, isListening: false }));
        // If enabled, restart recognition if it stops unexpectedly (e.g., after an error)
        if (isEnabled && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.warn('Attempted to restart recognition, but it might already be active or failed:', e);
          }
        }
      };
      recognitionRef.current = recognition;
    } else {
      setState(prev => ({ ...prev, recognitionError: 'Speech Recognition API not supported in this browser.' }));
      console.warn('Speech Recognition API not supported in this browser.');
    }
  }, [onCommand, isEnabled]);

  useEffect(() => {
    setupRecognition();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [setupRecognition]);

  useEffect(() => {
    if (recognitionRef.current) {
      if (isEnabled && !state.isListening) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Catch errors if recognition is already starting or running
          console.warn('Recognition start failed, might be already active:', e);
          setState(prev => ({ ...prev, isListening: true })); // Assume it's active if error is 'already started'
        }
      } else if (!isEnabled && state.isListening) {
        recognitionRef.current.stop();
      }
    }
  }, [isEnabled, state.isListening]);

  return {
    isListening: state.isListening,
    recognitionError: state.recognitionError,
    lastTranscript: state.lastTranscript,
  };
};

export default useSpeechRecognition;
