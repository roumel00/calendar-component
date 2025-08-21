'use client';

import { useDrop } from 'react-dnd';

export const useDroppableTimeSlot = ({ date, timeSlot, view, onEventDrop, isDisabled = false }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'CALENDAR_EVENT',
    canDrop: (item) => !isDisabled,
    drop: (item, monitor) => {
      if (monitor.didDrop()) {
        return; // Don't handle if dropped on a child
      }
      
      if (onEventDrop && !isDisabled) {
        onEventDrop(item, { date, timeSlot, view });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  const getBackgroundColor = () => {
    if (isDisabled) return 'bg-secondary hover:bg-secondary cursor-not-allowed';
    if (isOver && canDrop) return 'bg-blue-200 cursor-copy';
    if (isOver) return 'bg-blue-100';
    return 'cursor-pointer hover:bg-blue-50 transition-colors duration-200';
  };

  return {
    dropRef: drop,
    isOver,
    canDrop,
    getBackgroundColor
  };
};
