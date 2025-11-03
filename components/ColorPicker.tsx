
import React from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={label} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}: <span className="font-semibold uppercase">{value}</span>
      </label>
      <input
        id={label}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 border-none rounded-lg cursor-pointer p-0"
        style={{
          // Custom styling for the color input to make it look nicer
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none',
          backgroundColor: 'transparent',
        }}
      />
    </div>
  );
};

export default ColorPicker;
