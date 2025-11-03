import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from './components/Layout';
import TeleprompterDisplay from './components/TeleprompterDisplay';
import Controls from './components/Controls';
import { TeleprompterConfig, Script, SpeechCommand } from './types';
import {
  DEFAULT_CONFIG,
  DEFAULT_SCRIPT_CONTENT,
  LOCAL_STORAGE_SCRIPT_KEY,
  MAX_SPEED, MIN_SPEED, FONT_SIZE_STEP, SPEED_STEP // These are kept as they might be implicitly used for e.g. speed boundaries elsewhere
} from './constants';
import { v4 as uuidv4 } from 'uuid';
import {
  addOrUpdateScript,
  deleteScript,
  loadScriptsFromLocalStorage,
  saveScriptToLocalStorage,
} from './services/scriptStorageService';
import useSpeechRecognition from './hooks/useSpeechRecognition';
import { ensureApiKeySelected } from './services/geminiService';

const App: React.FC = () => {
  const [config, setConfig] = useState<TeleprompterConfig>(DEFAULT_CONFIG);
  const [currentScript, setCurrentScript] = useState<Script>(() => ({
    id: uuidv4(),
    name: "Default Script",
    content: DEFAULT_SCRIPT_CONTENT,
    lastModified: Date.now(),
  }));
  const [allScripts, setAllScripts] = useState<Script[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceScrollDelta, setVoiceScrollDelta] = useState(0);
  const voiceScrollDeltaTimeout = useRef<number | null>(null);
  const [resetScrollTrigger, setResetScrollTrigger] = useState(false); // To force scroll reset
  const [geminiApiKeyReady, setGeminiApiKeyReady] = useState(false);

  // Scroll position tracking for display/debug, can be used for remote sync later
  const [currentScrollPosition, setCurrentScrollPosition] = useState(0);

  const handleScrollPositionChange = useCallback((pos: number) => {
    setCurrentScrollPosition(pos);
  }, []);

  // Check Gemini API Key on app load
  useEffect(() => {
    const checkKey = async () => {
      try {
        const ready = await ensureApiKeySelected();
        setGeminiApiKeyReady(ready);
      } catch (error) {
        console.error('Failed to ensure Gemini API key:', error);
        setGeminiApiKeyReady(false);
      }
    };
    checkKey();
  }, []);

  // Load scripts from local storage on initial mount
  useEffect(() => {
    const storedScripts = loadScriptsFromLocalStorage();
    if (storedScripts.length > 0) {
      setAllScripts(storedScripts);
      // Try to load the most recently modified script
      const latestScript = storedScripts.sort((a, b) => b.lastModified - a.lastModified)[0];
      setCurrentScript(latestScript);
    } else {
      // If no scripts, save the default one
      const defaultScriptWithId = { ...currentScript, id: uuidv4(), lastModified: Date.now() };
      setAllScripts([defaultScriptWithId]);
      setCurrentScript(defaultScriptWithId);
      saveScriptToLocalStorage([defaultScriptWithId]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  // Speech Recognition Hook
  const handleSpeechCommand = useCallback((command: SpeechCommand) => {
    switch (command) {
      case SpeechCommand.SCROLL_UP:
        setVoiceScrollDelta(-config.scrollSpeed * 5); // Scroll up faster
        break;
      case SpeechCommand.SCROLL_DOWN:
        setVoiceScrollDelta(config.scrollSpeed * 5); // Scroll down faster
        break;
      case SpeechCommand.PAUSE:
        setIsPlaying(false);
        setVoiceScrollDelta(0);
        break;
      case SpeechCommand.RESUME:
        setIsPlaying(true);
        setVoiceScrollDelta(0);
        break;
    }

    // Clear voice scroll delta after a short period if not 'pause'/'resume'
    if (command === SpeechCommand.SCROLL_UP || command === SpeechCommand.SCROLL_DOWN) {
      if (voiceScrollDeltaTimeout.current) {
        clearTimeout(voiceScrollDeltaTimeout.current);
      }
      voiceScrollDeltaTimeout.current = window.setTimeout(() => {
        setVoiceScrollDelta(0);
      }, 500); // Reset delta after 0.5 seconds
    }
  }, [config.scrollSpeed]);

  useSpeechRecognition({
    onCommand: handleSpeechCommand,
    isEnabled: config.isVoiceActive,
  });

  const handleConfigChange = useCallback((newConfig: Partial<TeleprompterConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const handleScriptChange = useCallback((newScript: Script) => {
    setCurrentScript(newScript);
    // When script changes, force scroll to top
    setResetScrollTrigger(prev => !prev);
    // If the new script has a different ID, ensure it's saved/updated in the library
    setAllScripts(prev => addOrUpdateScript(prev, newScript));
  }, [allScripts]);

  const handleSaveNewOrUpdateScript = useCallback((scriptToSave: Script) => {
    const updatedScripts = addOrUpdateScript(allScripts, scriptToSave);
    setAllScripts(updatedScripts);
    setCurrentScript(scriptToSave); // Ensure current script reflects the saved state
  }, [allScripts]);

  const handleLoadScript = useCallback((scriptToLoad: Script) => {
    setCurrentScript(scriptToLoad);
    setIsPlaying(false); // Pause when a new script is loaded
    setResetScrollTrigger(prev => !prev); // Reset scroll position
  }, []);

  const handleDeleteScript = useCallback((scriptId: string) => {
    if (scriptId === currentScript.id) {
      alert("Cannot delete the currently active script. Please load another script first.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this script?")) {
      const updatedScripts = deleteScript(allScripts, scriptId);
      setAllScripts(updatedScripts);
    }
  }, [allScripts, currentScript.id]);

  const handleRenameScript = useCallback((scriptId: string, newName: string) => {
    const scriptToRename = allScripts.find(s => s.id === scriptId);
    if (scriptToRename) {
      const updatedScript = { ...scriptToRename, name: newName };
      const updatedScripts = addOrUpdateScript(allScripts, updatedScript);
      setAllScripts(updatedScripts);
      if (currentScript.id === scriptId) {
        setCurrentScript(updatedScript); // Update current script if it's the one being renamed
      }
    }
  }, [allScripts, currentScript.id]);

  const toggleIsPlaying = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Effect to handle playing/pausing based on user interaction or remote commands
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        toggleIsPlaying();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleIsPlaying]);

  return (
    <Layout isDarkMode={config.isDarkMode}>
      <TeleprompterDisplay
        script={currentScript.content}
        scrollSpeed={config.scrollSpeed}
        fontSize={config.fontSize}
        backgroundColor={config.backgroundColor}
        textColor={config.textColor}
        isMirrorMode={config.isMirrorMode}
        isPlaying={isPlaying}
        voiceScrollDelta={voiceScrollDelta}
        resetScrollTrigger={resetScrollTrigger}
        onScrollPositionChange={handleScrollPositionChange}
      />
      <Controls
        config={config}
        onConfigChange={handleConfigChange}
        currentScript={currentScript}
        onScriptChange={handleScriptChange}
        allScripts={allScripts}
        onSaveNewOrUpdateScript={handleSaveNewOrUpdateScript}
        onLoadScript={handleLoadScript}
        onDeleteScript={handleDeleteScript}
        onRenameScript={handleRenameScript}
        isPlaying={isPlaying} // Pass isPlaying state
        onTogglePlay={toggleIsPlaying} // Pass toggle function
      />
    </Layout>
  );
};

export default App;