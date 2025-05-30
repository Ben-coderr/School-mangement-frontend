'use client';

import { useState, useMemo } from 'react';
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

/* ---------- Public event shape the parent passes in --------------- */
export type CalendarEvent = {
  id:    number;
  title: string;
  start: Date;
  end:   Date;
};

type Props = { events: CalendarEvent[] };

/* ----------------------- Localizer -------------------------------- */
const localizer = momentLocalizer(moment);

/* ----------------------- Component -------------------------------- */
const BigCalendar = ({ events }: Props) => {
  const [view, setView] = useState<View>(Views.WORK_WEEK);

  /* Start on earliest lesson date (or today if none) */
  const defaultDate = useMemo(
    () =>
      events.length
        ? events.reduce((a, b) => (a.start < b.start ? a : b)).start
        : new Date(),
    [events],
  );

  const eventStyleGetter = () => ({
    style: {
      backgroundColor: '#6B7FD7', // purple
      borderRadius: '4px',
      color: '#fff',
    },
  });

  return (
    <Calendar
      localizer={localizer}
      events={events}
      defaultDate={defaultDate}
      view={view}
      onView={setView}
      views={['work_week', 'day']}
      startAccessor="start"
      endAccessor="end"
      titleAccessor="title"
      style={{ height: '98%' }}
      min={new Date(2025, 0, 1, 8)}
      max={new Date(2025, 0, 1, 17)}
      eventPropGetter={eventStyleGetter}
    />
  );
};

export default BigCalendar;
