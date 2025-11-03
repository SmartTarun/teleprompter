import React, { useState, useEffect, useCallback } from 'react';
import Button from './Button';
import Slider from './Slider';
import ColorPicker from './ColorPicker';
import ToggleButton from './ToggleButton';
import Modal from './Modal';
import ScriptInput from './ScriptInput';
import ScriptLibraryModal from './ScriptLibraryModal';
import { Script, TeleprompterConfig } from '../types';
import {
  MIN_SPEED, MAX_SPEED, SPEED_STEP,
  MIN_FONT_SIZE, MAX_FONT_SIZE, FONT_SIZE_STEP,
  AI_LANGUAGES,
} from '../constants';
import { summarizeScript, translateScript } from '../services/geminiService';

interface ControlsProps {
  config: TeleprompterConfig;
  onConfigChange: (newConfig: Partial<TeleprompterConfig>) => void;
  currentScript: Script;
  onScriptChange: (script: Script) => void;
  allScripts: Script[];
  onSaveNewOrUpdateScript: (script: Script) => void;
  onLoadScript: (script: Script) => void;
  onDeleteScript: (scriptId: string) => void;
  onRenameScript: (scriptId: string, newName: string) => void;
  isPlaying: boolean; // New prop
  onTogglePlay: () => void; // New prop
}

const Controls: React.FC<ControlsProps> = ({
  config,
  onConfigChange,
  currentScript,
  onScriptChange,
  allScripts,
  onSaveNewOrUpdateScript,
  onLoadScript,
  onDeleteScript,
  onRenameScript,
  isPlaying, // Destructure new prop
  onTogglePlay, // Destructure new prop
}) => {
  const [showScriptInputModal, setShowScriptInputModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [showSummarizeModal, setShowSummarizeModal] = useState(false);
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [translationResult, setTranslationResult] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState(AI_LANGUAGES[0].code);

  const handleSummarize = async () => {
    setIsSummarizing(true);
    setSummaryResult(null);
    try {
      const result = await summarizeScript(currentScript.content);
      setSummaryResult(result);
    } catch (error) {
      setSummaryResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleTranslate = async () => {
    setIsTranslating(true);
    setTranslationResult(null);
    try {
      const langName = AI_LANGUAGES.find(l => l.code === targetLanguage)?.name || targetLanguage;
      const result = await translateScript(currentScript.content, langName);
      setTranslationResult(result);
    } catch (error) {
      setTranslationResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const getOppositeColor = (hex: string) => {
    // Convert hex to RGB
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);

    // Calculate luminance
    // Using a more perceptually accurate formula (sRGB)
    const luminosity = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

    // Return black for bright colors, white for dark colors
    return luminosity > 0.5 ? '#000000' : '#FFFFFF';
  };

  // Effect to update text color when background color changes
  useEffect(() => {
    const newTextColor = getOppositeColor(config.backgroundColor);
    if (newTextColor !== config.textColor) {
      onConfigChange({ textColor: newTextColor });
    }
  }, [config.backgroundColor, config.textColor, onConfigChange]); // Added onConfigChange to dependency array

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 shadow-md flex flex-wrap gap-4 justify-center items-stretch overflow-y-auto max-h-[50vh] md:max-h-[35vh]">
      {/* Play/Pause Button - New Feature */}
      <div className="w-full mb-4">
        <Button onClick={onTogglePlay} variant="primary" size="lg" className="w-full py-4 text-xl">
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
      </div>

      {/* Script Management */}
      <div className="flex flex-col gap-2 w-full md:w-auto md:flex-1">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Script</h3>
        <Button onClick={() => setShowScriptInputModal(true)} variant="primary">
          Edit Script
        </Button>
        <Button onClick={() => onSaveNewOrUpdateScript(currentScript)} variant="secondary">
          Save Current Script
        </Button>
        <Button onClick={() => setShowLibraryModal(true)} variant="secondary">
          Open Script Library ({allScripts.length})
        </Button>
      </div>

      {/* Basic Controls */}
      <div className="flex flex-col gap-2 w-full md:w-auto md:flex-1">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Display</h3>
        <Slider
          label="Scroll Speed"
          min={MIN_SPEED}
          max={MAX_SPEED}
          step={SPEED_STEP}
          value={config.scrollSpeed}
          onChange={(val) => onConfigChange({ scrollSpeed: val })}
          unit="x"
        />
        <Slider
          label="Font Size"
          min={MIN_FONT_SIZE}
          max={MAX_FONT_SIZE}
          step={FONT_SIZE_STEP}
          value={config.fontSize}
          onChange={(val) => onConfigChange({ fontSize: val })}
          unit="px"
        />
        <ColorPicker
          label="Background Color"
          value={config.backgroundColor}
          onChange={(val) => onConfigChange({ backgroundColor: val })}
        />
        <ColorPicker
          label="Text Color"
          value={config.textColor}
          onChange={(val) => onConfigChange({ textColor: val })}
        />
      </div>

      {/* Feature Toggles */}
      <div className="flex flex-col gap-2 w-full md:w-auto md:flex-1">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Features</h3>
        <ToggleButton
          label="Mirror Mode"
          isOn={config.isMirrorMode}
          onToggle={(val) => onConfigChange({ isMirrorMode: val })}
        />
        {/* Corrected prop name from isVoiceMode to isVoiceActive to match TeleprompterConfig */}
        <ToggleButton
          label="Voice Activate"
          isOn={config.isVoiceActive}
          onToggle={(val) => onConfigChange({ isVoiceActive: val })}
        />
        <ToggleButton
          label="Dark Mode"
          isOn={config.isDarkMode}
          onToggle={(val) => onConfigChange({ isDarkMode: val })}
        />
      </div>

      {/* AI Features */}
      <div className="flex flex-col gap-2 w-full md:w-auto md:flex-1">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">AI Tools</h3>
        <Button onClick={() => setShowSummarizeModal(true)} variant="outline">
          Summarize Script (AI)
        </Button>
        <Button onClick={() => setShowTranslateModal(true)} variant="outline">
          Translate Script (AI)
        </Button>
      </div>

      {/* Modals */}
      <Modal isOpen={showScriptInputModal} onClose={() => setShowScriptInputModal(false)} title="Edit Script">
        <ScriptInput
          currentScriptContent={currentScript.content}
          onSave={(script) => {
            onScriptChange(script);
            setShowScriptInputModal(false);
          }}
          onClose={() => setShowScriptInputModal(false)}
        />
      </Modal>

      <ScriptLibraryModal
        isOpen={showLibraryModal}
        onClose={() => setShowLibraryModal(false)}
        scripts={allScripts}
        onLoadScript={(script) => {
          onLoadScript(script);
          setShowLibraryModal(false);
        }}
        onDeleteScript={onDeleteScript}
        onRenameScript={onRenameScript}
        currentScriptId={currentScript.id}
      />

      <Modal isOpen={showSummarizeModal} onClose={() => setShowSummarizeModal(false)} title="Summarize Script">
        <div className="flex flex-col gap-4">
          <p className="text-gray-700 dark:text-gray-300">
            Click 'Summarize' to get a concise summary of your current script using Gemini AI.
          </p>
          <Button onClick={handleSummarize} isLoading={isSummarizing} disabled={isSummarizing}>
            {isSummarizing ? 'Summarizing...' : 'Summarize Script'}
          </Button>
          {summaryResult && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md max-h-60 overflow-y-auto">
              <h4 className="font-semibold mb-2">Summary:</h4>
              <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{summaryResult}</p>
            </div>
          )}
        </div>
      </Modal>

      <Modal isOpen={showTranslateModal} onClose={() => setShowTranslateModal(false)} title="Translate Script">
        <div className="flex flex-col gap-4">
          <p className="text-gray-700 dark:text-gray-300">
            Select a target language and click 'Translate' to get your current script translated by Gemini AI.
          </p>
          <div>
            <label htmlFor="targetLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Target Language:
            </label>
            <select
              id="targetLanguage"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
            >
              {AI_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={handleTranslate} isLoading={isTranslating} disabled={isTranslating}>
            {isTranslating ? 'Translating...' : 'Translate Script'}
          </Button>
          {translationResult && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md max-h-60 overflow-y-auto">
              <h4 className="font-semibold mb-2">Translation:</h4>
              <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{translationResult}</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Controls;