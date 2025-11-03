
import { TeleprompterConfig } from './types';

export const DEFAULT_SCRIPT_CONTENT = `Welcome to the Gemini Teleprompter!

This is a versatile and user-friendly teleprompter application designed to enhance your presentations, video recordings, and public speaking engagements.

Key Features:

1.  **Script Input & Upload:** Easily type or paste your scripts directly into the app, or upload them from a file for quick setup.
2.  **Customizable Display:** Adjust scrolling speed, font size, background color, and text color to suit your visual preferences and environmental conditions.
3.  **Mirror Mode:** Activate mirror mode for camera setups, ensuring your text is readable even when reflected.
4.  **Voice-Activated Scrolling:** Control the scroll with simple voice commands like "scroll up", "scroll down", "pause", and "resume".
5.  **Script Saving:** Save your scripts locally to revisit them anytime.
6.  **Dark Mode:** Switch to dark mode for comfortable viewing in low-light environments.
7.  **AI Integration (Gemini):**
    *   **Summarize:** Condense long scripts into key points with the power of Gemini AI.
    *   **Translate:** Translate your script into different languages in real-time.

Getting Started:

*   Enter or upload your script using the 'Edit Script' button.
*   Adjust settings using the sliders and color pickers below.
*   Try voice control by enabling 'Voice Activate' and speaking commands.

We hope you enjoy using the Gemini Teleprompter for all your speaking needs!`;

export const DEFAULT_CONFIG: TeleprompterConfig = {
  scrollSpeed: 1.5,
  fontSize: 48,
  backgroundColor: '#000000', // Black
  textColor: '#FFFFFF',      // White
  isMirrorMode: false,
  isVoiceActive: false,
  isDarkMode: true,
};

export const MIN_SPEED = 0.1;
export const MAX_SPEED = 5;
export const SPEED_STEP = 0.1;

export const MIN_FONT_SIZE = 24;
export const MAX_FONT_SIZE = 120;
export const FONT_SIZE_STEP = 2;

export const LOCAL_STORAGE_SCRIPT_KEY = 'geminiTeleprompterScripts';

export const GEMINI_MODEL_FLASH = 'gemini-2.5-flash';
export const GEMINI_MODEL_PRO = 'gemini-2.5-pro';

export const AI_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
];
