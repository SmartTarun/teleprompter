
import React from 'react';
import { Script } from '../types';
import Button from './Button';
import Modal from './Modal';

interface ScriptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  scripts: Script[];
  onLoadScript: (script: Script) => void;
  onDeleteScript: (scriptId: string) => void;
  onRenameScript: (scriptId: string, newName: string) => void;
  currentScriptId: string | null;
}

const ScriptLibraryModal: React.FC<ScriptLibraryModalProps> = ({
  isOpen,
  onClose,
  scripts,
  onLoadScript,
  onDeleteScript,
  onRenameScript,
  currentScriptId,
}) => {
  const handleRename = (scriptId: string) => {
    const newName = prompt('Enter new name for the script:');
    if (newName && newName.trim()) {
      onRenameScript(scriptId, newName.trim());
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Script Library">
      {scripts.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No saved scripts yet. Save your current script to add it here!</p>
      ) : (
        <div className="space-y-4">
          {scripts.map((script) => (
            <div
              key={script.id}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border dark:border-gray-700 ${
                script.id === currentScriptId
                  ? 'bg-indigo-50 dark:bg-indigo-900 border-indigo-300 dark:border-indigo-700'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="flex-1 mb-2 sm:mb-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{script.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Last Modified: {new Date(script.lastModified).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                <Button size="sm" variant="secondary" onClick={() => handleRename(script.id)}>
                  Rename
                </Button>
                <Button size="sm" onClick={() => onLoadScript(script)} disabled={script.id === currentScriptId}>
                  Load
                </Button>
                <Button size="sm" variant="danger" onClick={() => onDeleteScript(script.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-end mt-6">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default ScriptLibraryModal;
