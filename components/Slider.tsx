import React from 'react';

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string; // Optional unit to display next to the value
  className?: string;
}

const Slider: React.FC<SliderProps> = ({
  label,
  min,
  max,
  step,
  value,
  onChange,
  unit,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={label} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}: <span className="font-semibold">{value}{unit}</span>
      </label>
      <input
        id={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:shadow-md
                   [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-indigo-600 [&::-moz-range-thumb]:shadow-md"
      />
    </div>
  );
};

export default Slider;