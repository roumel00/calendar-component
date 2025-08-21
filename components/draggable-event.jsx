'use client';

import { useDrag } from 'react-dnd';
import { memo } from 'react';

const DraggableEvent = memo(({ 
  calEvent, 
  children, 
  onEventClick, 
  className,
  view 
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'CALENDAR_EVENT',
    item: {
      id: calEvent.id,
      name: calEvent.name,
      startAt: calEvent.startAt,
      endAt: calEvent.endAt,
      status: calEvent.status,
      view,
      originalEvent: calEvent
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (onEventClick) {
      onEventClick(calEvent);
    }
  };

  return (
    <div
      ref={drag}
      onClick={handleClick}
      className={`${className} ${isDragging ? 'opacity-50' : ''}`}
      style={{ 
        cursor: 'grab',
        ...(isDragging && { cursor: 'grabbing' })
      }}
    >
      {children}
    </div>
  );
});

DraggableEvent.displayName = 'DraggableEvent';

export default DraggableEvent;
