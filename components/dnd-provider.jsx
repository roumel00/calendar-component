'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { memo } from 'react';

const DndCalendarProvider = memo(({ children }) => {
  return (
    <DndProvider 
      backend={HTML5Backend}
      options={{
        enableMouseEvents: true,
        enableTouchEvents: true,
        enableKeyboardEvents: true,
      }}
    >
      {children}
    </DndProvider>
  );
});

DndCalendarProvider.displayName = 'DndCalendarProvider';

export { DndCalendarProvider };
