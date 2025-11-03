
export interface Script {
  id: string;
  name: string;
  content: string;
  lastModified: number;
}

export interface TeleprompterConfig {
  scrollSpeed: number;
  fontSize: number;
  backgroundColor: string;
  textColor: string;
  isMirrorMode: boolean;
  isVoiceActive: boolean;
  isDarkMode: boolean;
}

export enum SpeechCommand {
  SCROLL_UP = 'scroll up',
  SCROLL_DOWN = 'scroll down',
  PAUSE = 'pause',
  RESUME = 'resume',
}
