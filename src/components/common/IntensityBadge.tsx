import React from 'react';
import { getIntensityColor } from '../../utils/constants';

interface IntensityBadgeProps {
  level?: number | null;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const IntensityBadge: React.FC<IntensityBadgeProps> = ({ 
  level, 
  showLabel = false, 
  size = 'md' 
}) => {
  if (level === null || level === undefined) {
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3.5 py-1.5 text-base font-semibold'
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 text-slate-400 font-medium ${sizeClasses[size]}`}
      >
        <span>Dor não informada</span>
      </span>
    );
  }

  const colorInfo = getIntensityColor(level);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3.5 py-1.5 text-base font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors ${colorInfo.bg} ${colorInfo.text} ${colorInfo.border} ${sizeClasses[size]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{level}/10</span>
      {showLabel && (
        <span className="opacity-90 font-normal">({colorInfo.label})</span>
      )}
    </span>
  );
};
