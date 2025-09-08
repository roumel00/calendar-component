'use client';

import { useState } from 'react';
import { Calendar } from "@/components/calendar";

const exampleCalEvents = [
  {
    "id": "c6f7b6b1-6f54-4f91-b184-55c7dfcc1e91",
    "name": "Enable impactful synergy",
    "startAt": "2025-09-08T11:14:59+10:00",
    "endAt": "2025-09-08T12:14:59+10:00",
    "status": { "id": "b69c7b72-6b42-4699-8a5e-9331b60eb749", "name": "Planned", "color": "#6B7280" }
  }
];

export default function Home() {
  const [events, setEvents] = useState(exampleCalEvents);

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


  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg p-6 w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-foreground">
          Calendar
        </h1>
        <Calendar
          events={events}
          onDayClick={handleDayClick}
          onTimeSlotClick={handleTimeSlotClick}
          onEventClick={handleEventClick}
          startTime={"08:00"}
          endTime={"20:00"}
          interval={15}
          disabledDays={[0, 6]}
        />
      </div>
    </div>
  );
}
