'use client';

import { useState, useCallback } from 'react';
import {
  CalendarBody,
  CalendarDate,
  CalendarDatePagination,
  CalendarHeader,
  CalendarItem,
  CalendarProvider,
  CalendarView,
  CalendarDatePicker,
} from '@/components/ui/shadcn-io/calendar';
import { DndCalendarProvider } from './dnd-provider';

const exampleCalEvents = [
  {
    "id": "c6f7b6b1-6f54-4f91-b184-55c7dfcc1e91",
    "name": "Enable impactful synergy",
    "startAt": "2025-08-22T07:15:00.000Z",
    "endAt": "2025-08-22T08:45:00.000Z",
    "status": { "id": "b69c7b72-6b42-4699-8a5e-9331b60eb749", "name": "Planned", "color": "#6B7280" }
  },
  {
    "id": "59c0dc4a-58a3-4d1c-8b2f-1d14e4c38f85",
    "name": "Streamline global markets",
    "startAt": "2025-08-24T13:30:00.000Z",
    "endAt": "2025-08-24T14:15:00.000Z",
    "status": { "id": "2ad47fa6-27fb-41a0-bc1a-07166dbea90e", "name": "In Progress", "color": "#F59E0B" }
  },
  {
    "id": "fa3183c0-87f0-46f7-9c2a-60a2a2c7ec1f",
    "name": "Optimize collaborative solution",
    "startAt": "2025-08-27T08:00:00.000Z",
    "endAt": "2025-08-27T09:00:00.000Z",
    "status": { "id": "3e85a77c-24d8-4210-a7c0-926db9f9e0f4", "name": "Done", "color": "#10B981" }
  },
  {
    "id": "2cbf6c28-37e0-4cf0-a0a3-efdc8a6d7a5e",
    "name": "Leverage seamless platform",
    "startAt": "2025-08-29T15:00:00.000Z",
    "endAt": "2025-08-29T16:30:00.000Z",
    "status": { "id": "b69c7b72-6b42-4699-8a5e-9331b60eb749", "name": "Planned", "color": "#6B7280" }
  },
  {
    "id": "7ac6f80d-d305-4204-b6ad-03ed2355c75f",
    "name": "Facilitate integrated channels",
    "startAt": "2025-09-01T11:45:00.000Z",
    "endAt": "2025-09-01T13:00:00.000Z",
    "status": { "id": "2ad47fa6-27fb-41a0-bc1a-07166dbea90e", "name": "In Progress", "color": "#F59E0B" }
  }
];
    
export const CalendarComponent = () => {
  const [calEvents, setCalEvents] = useState(exampleCalEvents);

  const handleDayClick = (day, month, year) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    console.log(`Clicked on day: ${day} ${monthNames[month]} ${year}`);
  };

  const handleTimeSlotClick = (date, timeSlot) => {
    console.log(`Clicked on ${date.toDateString()} at ${timeSlot.time}`);
  };

  const handleEventClick = (calEvent) => {
    console.log(`Clicked on event: ${calEvent.name} (${calEvent.status.name})`);
    console.log(`Event details:`, calEvent);
  };

  const handleEventDrop = useCallback((draggedEvent, dropTarget) => {
    const { date, timeSlot, view } = dropTarget;
    
    console.log('Event dropped:', {
      event: draggedEvent.name,
      targetDate: date,
      targetTime: timeSlot?.time,
      view
    });

    // Update the event with new date/time
    setCalEvents(prevEvents => 
      prevEvents.map(event => {
        if (event.id === draggedEvent.id) {
          const newEvent = { ...event };
          
          if (view === 'day' || view === 'week') {
            // For day/week views, update the time
            if (timeSlot) {
              const [hours, minutes] = timeSlot.time.split(':').map(Number);
              const newStartDate = new Date(date);
              newStartDate.setHours(hours, minutes, 0, 0);
              
              const duration = new Date(event.endAt).getTime() - new Date(event.startAt).getTime();
              const newEndDate = new Date(newStartDate.getTime() + duration);
              
              newEvent.startAt = newStartDate.toISOString();
              newEvent.endAt = newEndDate.toISOString();
            }
          } else {
            // For month view, keep the same time but change the date
            const originalStart = new Date(event.startAt);
            const originalEnd = new Date(event.endAt);
            
            const newStartDate = new Date(date);
            newStartDate.setHours(originalStart.getHours(), originalStart.getMinutes(), 0, 0);
            
            const newEndDate = new Date(date);
            newEndDate.setHours(originalEnd.getHours(), originalEnd.getMinutes(), 0, 0);
            
            newEvent.startAt = newStartDate.toISOString();
            newEvent.endAt = newEndDate.toISOString();
          }
          
          return newEvent;
        }
        return event;
      })
    );
  }, []);

  return (
    <div className="my-8">
      <div className="mb-4">
        <h2 className="text-2xl tracking-tight mb-2">Calendar</h2>
        <p className="text-muted-foreground text-lg mb-2">
          This component provides a calendar with drag and drop functionality for events.
        </p>
        <p className="text-sm text-muted-foreground">
          Try dragging events between different dates and time slots!
        </p>
      </div>

      <DndCalendarProvider>
        <CalendarProvider className="w-full">
          <CalendarDate>
            <CalendarDatePagination />
            <CalendarDatePicker />
            <CalendarView />
          </CalendarDate>
          <CalendarHeader />
          <CalendarBody 
            calEvents={calEvents}
            startTime="08:00"
            endTime="20:00"
            interval={15}
            disabledDays={[0, 6]}
            onDayClick={handleDayClick}
            onTimeSlotClick={handleTimeSlotClick}
            onEventClick={handleEventClick}
            onEventDrop={handleEventDrop}
          >
            {({ calEvent }) => <CalendarItem calEvent={calEvent} key={calEvent.id} />}
          </CalendarBody>
        </CalendarProvider>
      </DndCalendarProvider>
    </div>
  );
};  