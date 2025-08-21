'use client';

import { memo } from 'react';

const DragPreview = memo(({ item }) => {
  if (!item) return null;

  return (
    <div 
      className="fixed pointer-events-none z-50 bg-white border border-gray-300 rounded-lg shadow-lg px-3 py-2 text-sm"
      style={{ 
        backgroundColor: item.status?.color || '#6B7280',
        color: 'white',
        maxWidth: '200px'
      }}
    >
      <div className="font-medium">{item.name}</div>
      <div className="text-xs opacity-80">
        {new Date(item.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
        {new Date(item.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
});

DragPreview.displayName = 'DragPreview';

export default DragPreview;
