'use client';

import { useDrop } from 'react-dnd';
import { memo } from 'react';

const DroppableTimeSlot = memo(({ 
  children, 
  className, 
  onClick, 
  onEventDrop,
  date,
  timeSlot,
  isDisabled = false,
  view
}) => {
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

  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick(date, timeSlot);
    }
  };

  const getBackgroundColor = () => {
    if (isDisabled) return 'bg-secondary hover:bg-secondary cursor-not-allowed';
    if (isOver && canDrop) return 'bg-blue-200 cursor-copy';
    if (isOver) return 'bg-blue-100';
    return 'cursor-pointer hover:bg-blue-50 transition-colors duration-200';
  };

  return (
    <div
      ref={drop}
      className={`${className} ${getBackgroundColor()}`}
      onClick={handleClick}
    >
      {children}
    </div>
  );
});

DroppableTimeSlot.displayName = 'DroppableTimeSlot';

export default DroppableTimeSlot;
