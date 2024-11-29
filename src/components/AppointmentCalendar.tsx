import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Appointment } from '../services/appointmentsApi';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  onAddAppointment: () => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  appointments,
  onSelectAppointment,
  onAddAppointment,
}) => {
  const events = appointments.map(appointment => ({
    id: appointment.id?.toString(),
    title: `${appointment.attributes.patientName} - ${appointment.attributes.doctorName}`,
    start: appointment.attributes.date,
    extendedProps: { appointment },
    backgroundColor: getEventColor(appointment.attributes.status),
  }));

  const handleEventClick = (info: any) => {
    onSelectAppointment(info.event.extendedProps.appointment);
  };

  const handleDateSelect = (selectInfo: any) => {
    onAddAppointment();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        eventClick={handleEventClick}
        selectable={true}
        select={handleDateSelect}
        height="auto"
        slotMinTime="07:00:00"
        slotMaxTime="19:00:00"
        allDaySlot={false}
        slotDuration="00:30:00"
        expandRows={true}
        stickyHeaderDates={true}
        dayMaxEvents={true}
      />
    </div>
  );
};

const getEventColor = (status: string): string => {
  switch (status) {
    case 'Completed':
      return '#10B981'; // green
    case 'Canceled':
      return '#EF4444'; // red
    default:
      return '#3B82F6'; // blue
  }
};

export default AppointmentCalendar;