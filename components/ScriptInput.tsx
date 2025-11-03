
import React, { useState } from 'react';
import Button from './Button';
import { Script } from '../types';
import { DEFAULT_SCRIPT_CONTENT } from '../constants';
import { v4 as uuidv4 } from 'uuid';

interface ScriptInputProps {
  currentScriptContent: string;
  onSave: (script: Script) => void;
  onClose: () => void;
}

const ScriptInput: React.FC<ScriptInputProps> = ({
  currentScriptContent,
  onSave,
  onClose,
}) => {
  const [scriptText, setScriptText] = useState(currentScriptContent);
  const [scriptName, setScriptName] = useState('New Script');
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/plain') {
        setError('Please upload a plain text file (.txt).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setScriptText(content);
        setScriptName(file.name.split('.').slice(0, -1).join('.') || 'Uploaded Script');
        setError(null);
      };
      reader.onerror = () => {
        setError('Failed to read file.');
      };
      reader.readAsText(file);
    }
  };

  const handleSave = () => {
    if (!scriptText.trim()) {
      setError('Script content cannot be empty.');
      return;
    }
    const scriptId = uuidv4(); // Generate a new ID for a new script or use existing for update (handled by parent)
    onSave({
      id: scriptId,
      name: scriptName.trim() || `Script ${new Date().toLocaleDateString()}`,
      content: scriptText,
      lastModified: Date.now(),
    });
    onClose();
  };

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div>
        <label htmlFor="scriptName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Script Name:
        </label>
        <input
          id="scriptName"
          type="text"
          value={scriptName}
          onChange={(e) => setScriptName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Enter script name"
        />
      </div>
      <div>
        <label htmlFor="scriptText" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Edit Script:
        </label>
        <textarea
          id="scriptText"
          className="mt-1 block w-full h-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2"
          value={scriptText}
          onChange={(e) => {
            setScriptText(e.target.value);
            setError(null); // Clear error on input
          }}
          placeholder={DEFAULT_SCRIPT_CONTENT}
        ></textarea>
      </div>
      <div className="flex items-center gap-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Upload Script (.txt):
        </label>
        <input
          type="file"
          accept=".txt"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300 dark:hover:file:bg-indigo-800"
        />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Script
        </Button>
      </div>
    </div>
  );
};

export default ScriptInput;
