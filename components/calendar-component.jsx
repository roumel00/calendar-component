'use client';

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
import { useIsMobile } from '@/hooks/use-mobile';

export const CalendarComponent = ({ 
  events = [],
  onDayClick,
  onTimeSlotClick,
  onEventClick,
  startTime,
  endTime,
  interval,
  disabledDays
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={isMobile ? "my-4" : "my-8"}>
      <CalendarProvider className="w-full">
        <CalendarDate>
          <CalendarDatePagination />
          <CalendarDatePicker />
          {!isMobile && <CalendarView />}
        </CalendarDate>
        {!isMobile && <CalendarHeader />}
        <CalendarBody 
          calEvents={events}
          startTime={startTime}
          endTime={endTime}
          interval={isMobile ? 30 : interval}
          disabledDays={disabledDays}
          onDayClick={onDayClick}
          onTimeSlotClick={onTimeSlotClick}
          onEventClick={onEventClick}
        >
          {({ calEvent }) => <CalendarItem calEvent={calEvent} key={calEvent.id} />}
        </CalendarBody>
      </CalendarProvider>
    </div>
  );
};  