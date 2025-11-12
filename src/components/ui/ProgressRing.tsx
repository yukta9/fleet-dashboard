import React from 'react';

interface ProgressRingProps {
  radius?: number;
  circumference?: number;
  strokeDashoffset?: number;
  percent: number;
  strokeWidth?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function ProgressRing({
  radius = 45,
  circumference = 2 * Math.PI * 45,
  percent = 0,
  strokeWidth = 4,
  size = 'md',
  color = '#1F6FEB',
}: ProgressRingProps) {
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  };

  const r = radius;
  const c = circumference;
  const strokeDashoffset = c - (percent / 100) * c;

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]}`}>
      <svg
        width={r * 2}
        height={r * 2}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          stroke="#e2e8f0"
          fill="none"
          strokeWidth={strokeWidth}
          r={r}
          cx={r}
          cy={r}
        />
        {/* Progress circle */}
        <circle
          stroke={color}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={c}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={r}
          cx={r}
          cy={r}
          className="transition-all duration-500"
        />
      </svg>
      {/* Center text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-brand">{percent}%</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">Complete</span>
      </div>
    </div>
  );
}

export default ProgressRing;
