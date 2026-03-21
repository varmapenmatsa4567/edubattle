import React from 'react';
import { cn } from '@/lib/utils';
import { UI_LABELS } from '@/constants';

interface StatusPillProps {
  status: 'overdue' | 'due-today' | 'future' | 'no-date';
  dateStr?: string;
  className?: string;
}

/**
 * Reusable pill component for displaying assignment due status.
 */
const StatusPill: React.FC<StatusPillProps> = ({ status, dateStr, className }) => {
  const getStyles = () => {
    switch (status) {
      case 'overdue':
        return 'border-red-500 text-red-600 bg-red-50';
      case 'due-today':
        return 'border-orange-500 text-orange-600 bg-orange-50';
      case 'future':
        return 'border-gray-200 text-gray-600';
      default:
        return 'border-gray-100 text-gray-400';
    }
  };

  const getLabel = () => {
    if (status === 'overdue') return UI_LABELS.OVERDUE;
    if (status === 'due-today') return UI_LABELS.DUE_TODAY;
    return dateStr || 'No Date';
  };

  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors',
        getStyles(),
        className
      )}
    >
      {getLabel()}
    </span>
  );
};

export default StatusPill;
