'use client';

import { useDrop } from 'react-dnd';
import { memo } from 'react';

const DroppableDay = memo(({ 
  children, 
  className, 
  onClick, 
  onEventDrop,
  day,
  month,
  year,
  view
}) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'CALENDAR_EVENT',
    canDrop: (item) => true,
    drop: (item, monitor) => {
      if (monitor.didDrop()) {
        return; // Don't handle if dropped on a child
      }
      
      if (onEventDrop) {
        const targetDate = new Date(year, month, day);
        onEventDrop(item, { date: targetDate, view });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  const handleClick = () => {
    if (onClick) {
      onClick(day, month, year);
    }
  };

  const getBackgroundColor = () => {
    if (isOver && canDrop) return 'bg-blue-200 cursor-copy';
    if (isOver) return 'bg-blue-100';
    return 'hover:bg-blue-100 transition-colors duration-200';
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

DroppableDay.displayName = 'DroppableDay';

export default DroppableDay;
