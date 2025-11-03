
import React from 'react';

interface ToggleButtonProps {
  label: string;
  isOn: boolean;
  onToggle: (isOn: boolean) => void;
  className?: string;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ label, isOn, onToggle, className = '' }) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <button
        type="button"
        onClick={() => onToggle(!isOn)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          isOn ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
        }`}
        role="switch"
        aria-checked={isOn}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isOn ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

export default ToggleButton;
