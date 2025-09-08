'use client';

import { addDays, format, isSameDay, startOfWeek, getDay, getDaysInMonth, addWeeks, subWeeks } from 'date-fns';
import { atom, useAtom } from 'jotai';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  TableIcon,
  ChevronDownIcon,
  Rows3,
} from 'lucide-react';
import { createContext, memo, useCallback, useContext, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Constants
const CALENDAR_VIEWS = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day'
};

const TIME_INTERVALS = {
  FIFTEEN: 15,
  THIRTY: 30,
  SIXTY: 60
};

const SLOT_HEIGHTS = {
  [TIME_INTERVALS.FIFTEEN]: { pixels: 32, class: 'h-8', mobileClass: 'h-12' },
  [TIME_INTERVALS.THIRTY]: { pixels: 48, class: 'h-12', mobileClass: 'h-16' },
  [TIME_INTERVALS.SIXTY]: { pixels: 64, class: 'h-16', mobileClass: 'h-20' }
};

const MOBILE_SLOT_HEIGHTS = {
  [TIME_INTERVALS.FIFTEEN]: { pixels: 48, class: 'h-12' },
  [TIME_INTERVALS.THIRTY]: { pixels: 64, class: 'h-16' },
  [TIME_INTERVALS.SIXTY]: { pixels: 80, class: 'h-20' }
};

const DEFAULT_START_TIME = '08:00';
const DEFAULT_END_TIME = '20:00';
const DEFAULT_INTERVAL = TIME_INTERVALS.THIRTY;
const DEFAULT_LOCALE = 'en-US';
const DEFAULT_START_DAY = 0; // Sunday
const DAYS_IN_WEEK = 7;
const MAX_MONTH_EVENTS_DISPLAY = 3;

// Atoms for state management
const yearAtom = atom(new Date().getFullYear());
const monthAtom = atom(new Date().getMonth());
const dayAtom = atom(new Date().getDate());
const weekStartAtom = atom(startOfWeek(new Date(), { weekStartsOn: DEFAULT_START_DAY }));
const viewAtom = atom(CALENDAR_VIEWS.MONTH);

// Hooks
export const useCalendarYear = () => useAtom(yearAtom);
export const useCalendarMonth = () => useAtom(monthAtom);
export const useCalendarDay = () => useAtom(dayAtom);
export const useCalendarWeek = () => useAtom(weekStartAtom);

// Enhanced useCalendarView hook with mobile-first logic
export const useCalendarView = () => {
  const [view, setViewInternal] = useAtom(viewAtom);
  const isMobile = useIsMobile();

  // Override view setter to lock to DAY view on mobile
  const setView = useCallback((newView) => {
    if (isMobile) {
      // Only allow DAY view on mobile devices
      setViewInternal(CALENDAR_VIEWS.DAY);
    } else {
      setViewInternal(newView);
    }
  }, [isMobile, setViewInternal]);

  // Automatically set to DAY view when switching to mobile
  useEffect(() => {
    if (isMobile && view !== CALENDAR_VIEWS.DAY) {
      setViewInternal(CALENDAR_VIEWS.DAY);
    }
  }, [isMobile, view, setViewInternal]);

  return [view, setView];
};

// Context
export const CalendarContext = createContext({
  locale: DEFAULT_LOCALE,
  startDay: DEFAULT_START_DAY
});

// Utility functions
const convertNumToMonth = (num) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[num];
};

export const monthsForLocale = (localeName, monthFormat = 'long') => {
  const format = new Intl.DateTimeFormat(localeName, { month: monthFormat }).format;
  return [...Array(12).keys()].map((m) => format(new Date(Date.UTC(2021, m, 2))));
};

export const daysForLocale = (locale, startDay) => {
  const weekdays = [];
  const baseDate = new Date(2024, 0, startDay);

  for (let i = 0; i < DAYS_IN_WEEK; i++) {
    weekdays.push(new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(baseDate));
    baseDate.setDate(baseDate.getDate() + 1);
  }

  return weekdays;
};

// Time utilities
const parseTimeString = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatTimeFromMinutes = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const generateTimeSlots = (startTime, endTime, interval) => {
  const slots = [];
  const startMinutes = parseTimeString(startTime);
  const endMinutes = parseTimeString(endTime);
  
  for (let minutes = startMinutes; minutes < endMinutes; minutes += interval) {
    slots.push({
      time: formatTimeFromMinutes(minutes),
      minutes
    });
  }
  
  return slots;
};

const roundToInterval = (totalMinutes, interval, startMinutes, endMinutes, roundUp = false) => {
  const clampedMinutes = Math.max(startMinutes, Math.min(endMinutes, totalMinutes));
  
  if (roundUp) {
    return Math.ceil((clampedMinutes - startMinutes) / interval) * interval + startMinutes;
  }
  return Math.floor((clampedMinutes - startMinutes) / interval) * interval + startMinutes;
};

// Custom hooks
const useTimeSlots = (startTime, endTime, interval) => {
  return useMemo(() => {
    if (![TIME_INTERVALS.FIFTEEN, TIME_INTERVALS.THIRTY, TIME_INTERVALS.SIXTY].includes(interval)) {
      throw new Error('Interval must be 15, 30, or 60 minutes');
    }
    return generateTimeSlots(startTime, endTime, interval);
  }, [startTime, endTime, interval]);
};

const useEventProcessor = (calEvents, timeSlots, startTime, interval) => {
  return useCallback((targetDate) => {
    const dayEvents = calEvents.filter(event => 
      isSameDay(new Date(event.endAt), targetDate)
    );
    
    const startMinutes = parseTimeString(startTime);
    
    return dayEvents.map(event => {
      const startDate = new Date(event.startAt || event.endAt);
      const endDate = new Date(event.endAt);
      
      const eventStartMinutes = startDate.getHours() * 60 + startDate.getMinutes();
      const eventEndMinutes = endDate.getHours() * 60 + endDate.getMinutes();
      
      const roundedStartMinutes = roundToInterval(
        eventStartMinutes, 
        interval, 
        startMinutes, 
        startMinutes + timeSlots.length * interval, 
        false
      );
      const roundedEndMinutes = roundToInterval(
        eventEndMinutes, 
        interval, 
        startMinutes, 
        startMinutes + timeSlots.length * interval, 
        true
      );
      
      const topOffset = (roundedStartMinutes - startMinutes) / interval;
      const duration = roundedEndMinutes - roundedStartMinutes;
      const heightSlots = Math.max(1, duration / interval);
      
      if (topOffset >= 0 && topOffset < timeSlots.length) {
        return {
          ...event,
          topOffset,
          heightSlots,
          startMinutes: roundedStartMinutes,
          endMinutes: roundedEndMinutes
        };
      }
      return null;
    }).filter(Boolean);
  }, [calEvents, timeSlots, startTime, interval]);
};

// Component helpers
const isHourSlot = (slotIndex, interval) => slotIndex % (60 / interval) === 0;

const getSlotStyles = (interval, isMobile = false) => {
  return isMobile ? MOBILE_SLOT_HEIGHTS[interval] : SLOT_HEIGHTS[interval];
};

// Current time indicator
const CurrentTimeIndicator = memo(({ startTime, endTime, interval, slotHeight }) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const startMinutes = parseTimeString(startTime);
  const endMinutes = parseTimeString(endTime);
  
  if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
    return null;
  }
  
  const minutesFromStart = currentMinutes - startMinutes;
  const position = (minutesFromStart / interval) * slotHeight;
  
  return (
    <div 
      className="absolute left-0 right-0 z-50 pointer-events-none"
      style={{ top: `${position}px` }}
    >
      <div className="flex items-center">
        <div className="w-2 h-2 bg-red-500 rounded-full mr-1" />
        <div className="h-0.5 bg-red-500 flex-grow" />
      </div>
    </div>
  );
});

CurrentTimeIndicator.displayName = 'CurrentTimeIndicator';

// Time column component
const TimeColumn = memo(({ timeSlots, interval, width = 'w-20', isMobile = false }) => {
  const { pixels: slotHeight, class: slotHeightClass } = getSlotStyles(interval, isMobile);
  
  return (
    <div className={cn(width, 'flex-shrink-0 border-r')}>
      {timeSlots.map((slot, index) => (
        <div 
          key={slot.time} 
          className={cn(
            'text-muted-foreground text-right flex items-center justify-end',
            slotHeightClass,
            isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-2',
            isHourSlot(index, interval) ? 'border-t border-gray-300 font-medium' : 'border-t border-gray-100'
          )}
        >
          {isHourSlot(index, interval) && (
            <div className="flex flex-col items-end">
              <span>{slot.time}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

TimeColumn.displayName = 'TimeColumn';

// Event overlay component
const EventOverlay = memo(({ events, children, slotHeight, topOffset = 0, onEventClick, isMobile = false }) => (
  <div className={cn(
    "absolute inset-0 pointer-events-none",
    isMobile ? "px-1" : "px-2"
  )} style={{ top: `${topOffset}px` }}>
    {events.map((eventData, eventIndex) => (
      <div
        key={eventData.id || eventIndex}
        className={cn(
          "absolute pointer-events-auto",
          isMobile ? "left-1 right-1" : "left-2 right-2"
        )}
        style={{
          top: `${eventData.topOffset * slotHeight}px`,
          height: `${eventData.heightSlots * slotHeight - 2}px`,
          zIndex: eventIndex + 1
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (onEventClick) {
            onEventClick(eventData);
          }
        }}
      >
        {children({ calEvent: eventData })}
      </div>
    ))}
  </div>
));

EventOverlay.displayName = 'EventOverlay';

// Time slot component
const TimeSlot = memo(({ 
  slot, 
  slotIndex, 
  targetDate, 
  isDisabled, 
  interval, 
  slotHeightClass, 
  onTimeSlotClick, 
  isToday,
  isMobile = false
}) => {
  const handleClick = useCallback(() => {
    if (isDisabled) return;
    if (onTimeSlotClick) {
      onTimeSlotClick(targetDate, slot);
    }
  }, [targetDate, slot, isDisabled, onTimeSlotClick]);

  return (
    <div
      key={slot.time}
      className={cn(
        'relative transition-colors duration-100',
        isDisabled ? 
          'bg-secondary hover:bg-secondary cursor-not-allowed' : 
          'cursor-pointer hover:bg-blue-100',
        slotHeightClass,
        isHourSlot(slotIndex, interval) ? 'border-t border-gray-300' : 'border-t border-gray-100',
        isToday && !isDisabled && 'bg-blue-50/30',
        isMobile && 'touch-manipulation'
      )}
      onClick={handleClick}
      style={{
        minHeight: isMobile ? '44px' : 'auto'
      }}
    />
  );
});

TimeSlot.displayName = 'TimeSlot';

// Day view component
const DayView = memo(({
  calEvents,
  children,
  startTime = DEFAULT_START_TIME,
  endTime = DEFAULT_END_TIME,
  interval = DEFAULT_INTERVAL,
  disabledDays = [],
  onTimeSlotClick,
  onEventClick
}) => {
  const [year] = useCalendarYear();
  const [month] = useCalendarMonth();
  const [day] = useCalendarDay();
  const isMobile = useIsMobile();

  const currentDay = useMemo(() => new Date(year, month, day), [year, month, day]);
  const timeSlots = useTimeSlots(startTime, endTime, interval);
  const processEvents = useEventProcessor(calEvents, timeSlots, startTime, interval);
  const dayEvents = useMemo(() => processEvents(currentDay), [processEvents, currentDay]);

  const { pixels: slotHeight, class: slotHeightClass } = getSlotStyles(interval, isMobile);
  const isToday = isSameDay(currentDay, new Date());
  const dayOfWeek = currentDay.getDay();
  const isDisabled = disabledDays.includes(dayOfWeek);

  // Auto-scroll to current time on mobile
  const scrollContainerRef = useCallback((node) => {
    if (node && isMobile && isToday) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const startMinutes = parseTimeString(startTime);
      
      if (currentMinutes >= startMinutes) {
        const minutesFromStart = currentMinutes - startMinutes;
        const scrollPosition = (minutesFromStart / interval) * slotHeight;
        
        // Scroll to current time with some offset for better UX
        setTimeout(() => {
          node.scrollTo({
            top: Math.max(0, scrollPosition - 100),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, [isMobile, isToday, startTime, interval, slotHeight]);

  return (
    <div 
      ref={scrollContainerRef}
      className={cn(
        "flex flex-grow overflow-auto",
        isMobile && "scroll-smooth touch-pan-y"
      )}
    >
      <TimeColumn 
        timeSlots={timeSlots} 
        interval={interval} 
        width={isMobile ? 'w-16' : 'w-20'}
        isMobile={isMobile}
      />
      
      <div className="flex-grow relative">
        {timeSlots.map((slot, slotIndex) => (
          <TimeSlot
            key={slot.time}
            slot={slot}
            slotIndex={slotIndex}
            targetDate={currentDay}
            isDisabled={isDisabled}
            startTime={startTime}
            interval={interval}
            slotHeightClass={slotHeightClass}
            onTimeSlotClick={onTimeSlotClick}
            isToday={isToday}
            isMobile={isMobile}
          />
        ))}
        
        <EventOverlay 
          events={dayEvents} 
          slotHeight={slotHeight} 
          onEventClick={onEventClick}
          isMobile={isMobile}
        >
          {children}
        </EventOverlay>

        {isToday && (
          <CurrentTimeIndicator 
            startTime={startTime} 
            endTime={endTime} 
            interval={interval}
            slotHeight={slotHeight}
          />
        )}
      </div>
    </div>
  );
});

DayView.displayName = 'DayView';

// Week day column component
const WeekDayColumn = memo(({
  day,
  dayIndex,
  timeSlots,
  dayEvents,
  interval,
  slotHeight,
  slotHeightClass,
  disabledDays,
  children,
  onTimeSlotClick,
  onEventClick,
  startTime
}) => {
  const isToday = isSameDay(day, new Date());
  const isDisabled = disabledDays.includes(dayIndex);

  return (
    <div
      key={day.toISOString()}
      className={cn(
        'border-r relative',
        dayIndex === 6 && 'border-r-0',
        isToday && 'bg-blue-50'
      )}
    >
      <div className={cn(
        'h-12 p-2 text-center text-sm font-medium',
        isToday ? 'text-blue-600 bg-blue-100' : 'text-muted-foreground'
      )}>
        {format(day, 'd')}
      </div>
      
      {timeSlots.map((slot, slotIndex) => (
        <TimeSlot
          key={`${day.toISOString()}-${slot.time}`}
          slot={slot}
          slotIndex={slotIndex}
          targetDate={day}
          isDisabled={isDisabled}
          startTime={startTime}
          interval={interval}
          slotHeightClass={slotHeightClass}
          onTimeSlotClick={onTimeSlotClick}
          isToday={isToday}
        />
      ))}
      
      <EventOverlay events={dayEvents} slotHeight={slotHeight} topOffset={48} onEventClick={onEventClick}>
        {children}
      </EventOverlay>
    </div>
  );
});

WeekDayColumn.displayName = 'WeekDayColumn';

// Week view component
const WeekView = memo(({
  calEvents,
  children,
  startTime = DEFAULT_START_TIME,
  endTime = DEFAULT_END_TIME,
  interval = DEFAULT_INTERVAL,
  disabledDays = [],
  startDay,
  onTimeSlotClick,
  onEventClick
}) => {
  const [weekStart] = useCalendarWeek();

  const weekDays = useMemo(() => {
    const days = [];
    const start = startOfWeek(weekStart, { weekStartsOn: startDay });
    
    for (let i = 0; i < DAYS_IN_WEEK; i++) {
      days.push(addDays(start, i));
    }
    
    return days;
  }, [weekStart, startDay]);

  const timeSlots = useTimeSlots(startTime, endTime, interval);
  const processEvents = useEventProcessor(calEvents, timeSlots, startTime, interval);
  
  const eventsByDay = useMemo(() => {
    const result = {};
    weekDays.forEach((day, dayIndex) => {
      result[dayIndex] = processEvents(day);
    });
    return result;
  }, [weekDays, processEvents]);

  const { pixels: slotHeight, class: slotHeightClass } = getSlotStyles(interval);

  return (
    <div className="flex flex-grow overflow-auto">
      <div className="w-16 flex-shrink-0 border-r">
        <div className="h-12" />
        {timeSlots.map((slot, index) => (
          <div 
            key={slot.time} 
            className={cn(
              'text-xs text-muted-foreground px-2 py-1 text-right',
              slotHeightClass,
              isHourSlot(index, interval) ? 'border-t border-gray-300' : 'border-t border-gray-100'
            )}
          >
            {isHourSlot(index, interval) && slot.time}
          </div>
        ))}
      </div>
      
      <div className="flex-grow grid grid-cols-7">
        {weekDays.map((day, dayIndex) => {
          const dayEvents = eventsByDay[dayIndex] || [];
          
          return (
            <WeekDayColumn
              key={day.toISOString()}
              day={day}
              dayIndex={dayIndex}
              timeSlots={timeSlots}
              dayEvents={dayEvents}
              interval={interval}
              slotHeight={slotHeight}
              slotHeightClass={slotHeightClass}
              disabledDays={disabledDays}
              children={children}
              onTimeSlotClick={onTimeSlotClick}
              onEventClick={onEventClick}
              startTime={startTime}
            />
          );
        })}
      </div>
    </div>
  );
});

WeekView.displayName = 'WeekView';

// Out of bounds day component
const OutOfBoundsDay = memo(({ day }) => (
  <div className="relative h-full w-full bg-secondary p-1 text-muted-foreground text-xs">
    {day}
  </div>
));

OutOfBoundsDay.displayName = 'OutOfBoundsDay';

// Month day component
const MonthDay = memo(({ 
  day, 
  month, 
  year, 
  calEventsForDay, 
  children, 
  onDayClick, 
  onEventClick,
  isToday
}) => {
  const handleDayClick = useCallback(() => {
    if (onDayClick) {
      onDayClick(day, month, year);
    }
  }, [onDayClick, day, month, year]);

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col gap-1 p-1 text-muted-foreground text-xs cursor-pointer transition-colors duration-100",
        'hover:bg-blue-100',
        isToday && 'bg-blue-50'
      )}
      onClick={handleDayClick}
    >
      {day}
      <div>
        {calEventsForDay.slice(0, MAX_MONTH_EVENTS_DISPLAY).map((calEvent) => (
          <div 
            key={calEvent.id} 
            onClick={(e) => {
              e.stopPropagation();
              if (onEventClick) {
                onEventClick(calEvent);
              }
            }}
          >
            {children({ calEvent })}
          </div>
        ))}
      </div>
      {calEventsForDay.length > MAX_MONTH_EVENTS_DISPLAY && (
        <span className="block text-muted-foreground text-xs">
          +{calEventsForDay.length - MAX_MONTH_EVENTS_DISPLAY} more
        </span>
      )}
    </div>
  );
});

MonthDay.displayName = 'MonthDay';

// Month view component
const MonthView = memo(({ calEvents, children, startDay, onDayClick, onEventClick }) => {
  const [month] = useCalendarMonth();
  const [year] = useCalendarYear();

  const currentMonthDate = useMemo(() => new Date(year, month, 1), [year, month]);
  const daysInMonth = useMemo(() => getDaysInMonth(currentMonthDate), [currentMonthDate]);
  const firstDay = useMemo(
    () => (getDay(currentMonthDate) - startDay + DAYS_IN_WEEK) % DAYS_IN_WEEK,
    [currentMonthDate, startDay]
  );

  const prevMonthData = useMemo(() => {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonthDays = getDaysInMonth(new Date(prevMonthYear, prevMonth, 1));
    return { 
      prevMonthDays, 
      prevMonthDaysArray: Array.from({ length: prevMonthDays }, (_, i) => i + 1) 
    };
  }, [month, year]);

  const nextMonthData = useMemo(() => {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    const nextMonthDays = getDaysInMonth(new Date(nextMonthYear, nextMonth, 1));
    return { 
      nextMonthDaysArray: Array.from({ length: nextMonthDays }, (_, i) => i + 1) 
    };
  }, [month, year]);

  const calEventsByDay = useMemo(() => {
    const result = {};
    for (let day = 1; day <= daysInMonth; day++) {
      result[day] = calEvents.filter(event => 
        isSameDay(new Date(event.endAt), new Date(year, month, day))
      );
    }
    return result;
  }, [calEvents, daysInMonth, year, month]);

  const days = [];

  // Previous month days
  for (let i = 0; i < firstDay; i++) {
    const day = prevMonthData.prevMonthDaysArray[prevMonthData.prevMonthDays - firstDay + i];
    if (day) {
      days.push(<OutOfBoundsDay day={day} key={`prev-${i}`} />);
    }
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const calEventsForDay = calEventsByDay[day] || [];
    const currentDay = new Date(year, month, day);
    const isToday = isSameDay(currentDay, new Date());

    days.push(
      <MonthDay
        key={day}
        day={day}
        month={month}
        year={year}
        calEventsForDay={calEventsForDay}
        children={children}
        onDayClick={onDayClick}
        onEventClick={onEventClick}
        isToday={isToday}
      />
    );
  }

  // Next month days
  const remainingDays = DAYS_IN_WEEK - ((firstDay + daysInMonth) % DAYS_IN_WEEK);
  if (remainingDays < DAYS_IN_WEEK) {
    for (let i = 0; i < remainingDays; i++) {
      const day = nextMonthData.nextMonthDaysArray[i];
      if (day) {
        days.push(<OutOfBoundsDay day={day} key={`next-${i}`} />);
      }
    }
  }

  return (
    <div className="grid flex-grow grid-cols-7">
      {days.map((day, index) => (
        <div
          className={cn(
            'relative aspect-square overflow-hidden border-t border-r',
            index % DAYS_IN_WEEK === 6 && 'border-r-0'
          )}
          key={index}
        >
          {day}
        </div>
      ))}
    </div>
  );
});

MonthView.displayName = 'MonthView';

// Main calendar body component
export const CalendarBody = memo(({
  calEvents,
  children,
  startTime = DEFAULT_START_TIME,
  endTime = DEFAULT_END_TIME,
  interval = DEFAULT_INTERVAL,
  disabledDays = [],
  onDayClick,
  onTimeSlotClick,
  onEventClick
}) => {
  const { startDay } = useContext(CalendarContext);
  const [view] = useCalendarView();

  const commonProps = {
    calEvents,
    children,
    startTime,
    endTime,
    interval,
    disabledDays,
    onDayClick,
    onTimeSlotClick,
    onEventClick
  };

  switch (view) {
    case CALENDAR_VIEWS.DAY:
      return <DayView {...commonProps} />;
    case CALENDAR_VIEWS.WEEK:
      return <WeekView {...commonProps} startDay={startDay} />;
    case CALENDAR_VIEWS.MONTH:
    default:
      return <MonthView {...commonProps} startDay={startDay} />;
  }
});

CalendarBody.displayName = 'CalendarBody';

// Navigation hooks
const useCalendarNavigation = () => {
  const [view] = useCalendarView();
  const [month, setMonth] = useCalendarMonth();
  const [year, setYear] = useCalendarYear();
  const [day, setDay] = useCalendarDay();
  const [weekStart, setWeekStart] = useCalendarWeek();

  const navigateToToday = useCallback(() => {
    const today = new Date();
    switch (view) {
      case CALENDAR_VIEWS.DAY:
        setYear(today.getFullYear());
        setMonth(today.getMonth());
        setDay(today.getDate());
        break;
      case CALENDAR_VIEWS.WEEK:
        setWeekStart(startOfWeek(today, { weekStartsOn: DEFAULT_START_DAY }));
        break;
      case CALENDAR_VIEWS.MONTH:
      default:
        setMonth(today.getMonth());
        setYear(today.getFullYear());
        break;
    }
  }, [view, setMonth, setYear, setDay, setWeekStart]);

  const navigatePrevious = useCallback(() => {
    switch (view) {
      case CALENDAR_VIEWS.DAY:
        const currentDate = new Date(year, month, day);
        const previousDay = addDays(currentDate, -1);
        setYear(previousDay.getFullYear());
        setMonth(previousDay.getMonth());
        setDay(previousDay.getDate());
        break;
      case CALENDAR_VIEWS.WEEK:
        setWeekStart(subWeeks(weekStart, 1));
        break;
      case CALENDAR_VIEWS.MONTH:
      default:
        if (month === 0) {
          setMonth(11);
          setYear(year - 1);
        } else {
          setMonth(month - 1);
        }
        break;
    }
  }, [view, month, year, day, weekStart, setMonth, setYear, setDay, setWeekStart]);

  const navigateNext = useCallback(() => {
    switch (view) {
      case CALENDAR_VIEWS.DAY:
        const currentDate = new Date(year, month, day);
        const nextDay = addDays(currentDate, 1);
        setYear(nextDay.getFullYear());
        setMonth(nextDay.getMonth());
        setDay(nextDay.getDate());
        break;
      case CALENDAR_VIEWS.WEEK:
        setWeekStart(addWeeks(weekStart, 1));
        break;
      case CALENDAR_VIEWS.MONTH:
      default:
        if (month === 11) {
          setMonth(0);
          setYear(year + 1);
        } else {
          setMonth(month + 1);
        }
        break;
    }
  }, [view, month, year, day, weekStart, setMonth, setYear, setDay, setWeekStart]);

  return { navigateToToday, navigatePrevious, navigateNext };
};

// Date pagination component
export const CalendarDatePagination = memo(({ className }) => {
  const { navigateToToday, navigatePrevious, navigateNext } = useCalendarNavigation();
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      'flex items-center gap-2 w-full',
      isMobile ? 'justify-between px-2' : 'justify-center',
      className
    )}>
      <Button 
        onClick={navigatePrevious} 
        size={isMobile ? "lg" : "icon"} 
        variant="ghost"
        className={cn(
          isMobile && 'min-h-[56px] min-w-[56px] text-lg p-4'
        )}
      >
        <ChevronLeftIcon size={isMobile ? 24 : 16} />
      </Button>
      <Button 
        onClick={navigateToToday} 
        variant="ghost"
        size={isMobile ? "lg" : "default"}
        className={cn(
          isMobile && 'min-h-[56px] px-8 text-lg font-semibold py-4'
        )}
      >
        Today
      </Button>
      <Button 
        onClick={navigateNext} 
        size={isMobile ? "lg" : "icon"} 
        variant="ghost"
        className={cn(
          isMobile && 'min-h-[56px] min-w-[56px] text-lg p-4'
        )}
      >
        <ChevronRightIcon size={isMobile ? 24 : 16} />
      </Button>
    </div>
  );
});

CalendarDatePagination.displayName = 'CalendarDatePagination';

// View switcher component
export const CalendarView = memo(() => {
  const [view, setView] = useCalendarView();

  const handleViewChange = useCallback((newView) => {
    setView(newView);
  }, [setView]);

  const viewConfig = {
    [CALENDAR_VIEWS.DAY]: { icon: Rows3, label: 'Day' },
    [CALENDAR_VIEWS.WEEK]: { icon: TableIcon, label: 'Week' },
    [CALENDAR_VIEWS.MONTH]: { icon: CalendarIcon, label: 'Month' }
  };

  const currentView = viewConfig[view] || viewConfig[CALENDAR_VIEWS.MONTH];
  const IconComponent = currentView.icon;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 min-w-[120px]">
          <IconComponent size={16} />
          {currentView.label}
          <ChevronDownIcon size={12} className="opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.entries(viewConfig).map(([viewKey, config]) => {
          const ViewIcon = config.icon;
          return (
            <DropdownMenuItem key={viewKey} onClick={() => handleViewChange(viewKey)}>
              <ViewIcon size={16} />
              {config.label} View
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

CalendarView.displayName = 'CalendarView';

// Date picker component
export const CalendarDatePicker = memo(() => {
  const [view] = useCalendarView();
  const [, setMonth] = useCalendarMonth();
  const [, setYear] = useCalendarYear();
  const [, setDay] = useCalendarDay();
  const [, setWeekStart] = useCalendarWeek();
  const { startDay } = useContext(CalendarContext);
  const isMobile = useIsMobile();

  const handleDateSelect = useCallback((selectedDate) => {
    if (!selectedDate) return;

    switch (view) {
      case CALENDAR_VIEWS.DAY:
        setYear(selectedDate.getFullYear());
        setMonth(selectedDate.getMonth());
        setDay(selectedDate.getDate());
        break;
      case CALENDAR_VIEWS.WEEK:
        const newWeekStart = startOfWeek(selectedDate, { weekStartsOn: startDay });
        setWeekStart(newWeekStart);
        break;
      case CALENDAR_VIEWS.MONTH:
      default:
        setMonth(selectedDate.getMonth());
        setYear(selectedDate.getFullYear());
        break;
    }
  }, [view, setMonth, setYear, setDay, setWeekStart, startDay]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size={isMobile ? "lg" : "default"}
          className={cn(
            "w-auto justify-start text-left font-normal",
            isMobile && "min-h-[56px] px-6 py-4 text-lg font-medium"
          )}
        >
          <CalendarIcon size={isMobile ? 20 : 16} />
          <span>Pick a date</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn(
        "w-auto p-0",
        isMobile && "scale-140"
      )}>
      <Calendar
        mode="single"
        onSelect={handleDateSelect}
        className="rounded-md border shadow-sm"
        captionLayout="dropdown"
      />
      </PopoverContent>
    </Popover>
  );
});

CalendarDatePicker.displayName = 'CalendarDatePicker';

// Date display component
export const CalendarDate = memo(({ children }) => {
  const [view] = useCalendarView();
  const [month] = useCalendarMonth();
  const [year] = useCalendarYear();
  const [day] = useCalendarDay();
  const [weekStart] = useCalendarWeek();
  const isMobile = useIsMobile();

  const dateDisplay = useMemo(() => {
    switch (view) {
      case CALENDAR_VIEWS.DAY:
        const currentDay = new Date(year, month, day);
        return format(currentDay, 'EEEE, MMMM d, yyyy');
      case CALENDAR_VIEWS.WEEK:
        const weekEnd = addDays(weekStart, 6);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case CALENDAR_VIEWS.MONTH:
      default:
        return `${convertNumToMonth(month)} ${year}`;
    }
  }, [view, month, year, day, weekStart]);

  return (
    <div className={cn(
      "p-3 border-b",
      isMobile ? "flex flex-col gap-3 items-center" : "flex items-center justify-between"
    )}>
      <div className="text-lg font-semibold text-center">
        {dateDisplay}
      </div>
      <div className={cn(
        "flex gap-2 items-center",
        isMobile ? "flex-col w-full" : "justify-center"
      )}>
        {children}
      </div>
    </div>
  );
});

CalendarDate.displayName = 'CalendarDate';

// Header component
export const CalendarHeader = memo(({ className }) => {
  const { locale, startDay } = useContext(CalendarContext);
  const [view] = useCalendarView();
  const [weekStart] = useCalendarWeek();
  const [year] = useCalendarYear();
  const [month] = useCalendarMonth();
  const [day] = useCalendarDay();

  const daysData = useMemo(() => {
    const days = daysForLocale(locale, startDay);
    
    switch (view) {
      case CALENDAR_VIEWS.WEEK:
        const start = startOfWeek(weekStart, { weekStartsOn: startDay });
        return days.map((dayName, index) => ({
          name: dayName,
          date: addDays(start, index)
        }));
      case CALENDAR_VIEWS.DAY:
        const currentDay = new Date(year, month, day);
        const dayName = format(currentDay, 'EEEE');
        return [{ name: dayName, date: currentDay }];
      case CALENDAR_VIEWS.MONTH:
      default:
        return days.map((dayName) => ({ name: dayName }));
    }
  }, [locale, startDay, view, weekStart, year, month, day]);

  if (view === CALENDAR_VIEWS.DAY) {
    return (
      <div className={cn('flex flex-col', className)}>
        <div className="flex">
          <div className="w-20 flex-shrink-0 border-r" />
          <div className="flex-grow">
            <div className="p-4 text-center border-r">
              <div className="text-lg font-semibold text-muted-foreground">
                {format(new Date(year, month, day), 'EEEE')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === CALENDAR_VIEWS.WEEK) {
    return (
      <div className={cn('flex flex-col', className)}>
        <div className="flex">
          <div className="w-16 flex-shrink-0 border-r" />
          <div className="flex-grow grid grid-cols-7">
            {daysData.map(({ name, date }) => {
              const isToday = date && isSameDay(date, new Date());
              
              return (
                <div 
                  key={name}
                  className={cn(
                    "p-3 text-center border-r",
                    daysData.findIndex(d => d.name === name) === 6 && 'border-r-0'
                  )}
                >
                  <div className={cn(
                    'text-xs font-medium',
                    isToday ? 'text-blue-600' : 'text-muted-foreground'
                  )}>
                    {name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="grid flex-grow grid-cols-7">
        {daysData.map(({ name }) => (
          <div className="p-3 text-right text-muted-foreground text-xs" key={name}>
            {name}
          </div>
        ))}
      </div>
    </div>
  );
});

CalendarHeader.displayName = 'CalendarHeader';

// Calendar item component
export const CalendarItem = memo(({ calEvent, className }) => {
  const [view] = useCalendarView();
  const isMobile = useIsMobile();

  if (view === CALENDAR_VIEWS.WEEK || view === CALENDAR_VIEWS.DAY) {
    return (
      <div 
        className={cn(
          'rounded text-white font-medium h-full flex items-start overflow-hidden transition-all duration-200 ease-in-out cursor-pointer',
          isMobile ? 
            'text-xs p-1.5 touch-manipulation' : 
            'text-xs p-2 hover:-translate-y-1 hover:shadow-lg',
          className
        )}  
        style={{ 
          backgroundColor: calEvent.status.color,
          minHeight: isMobile ? '44px' : 'auto'
        }}
      >
        <span className="block w-full whitespace-normal break-words [overflow-wrap:anywhere]">
          {calEvent.name}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'flex items-center gap-2 transition-all duration-200 ease-in-out cursor-pointer',
        isMobile ? 
          'touch-manipulation' : 
          'hover:-translate-y-0.5 hover:shadow-lg',
        className
      )}
    >
      <div
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: calEvent.status.color }} 
      />
      <span className="truncate">{calEvent.name}</span>
    </div>
  );
});

CalendarItem.displayName = 'CalendarItem';

// Provider component
export const CalendarProvider = memo(({
  locale = DEFAULT_LOCALE,
  startDay = DEFAULT_START_DAY,
  children,
  className
}) => (
  <CalendarContext.Provider value={{ locale, startDay }}>
    <div className={cn('relative flex flex-col', className)}>
      {children}
    </div>
  </CalendarContext.Provider>
));

CalendarProvider.displayName = 'CalendarProvider';