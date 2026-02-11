import React from 'react';
import { Appointment, APPOINTMENT_STATUSES } from '../../types/appointment.types';

interface AppointmentCalendarProps {
  weekStart: Date;
  appointments: Appointment[];
  onCreateAppointment: (dateTime: Date) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (appointment: Appointment) => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  weekStart,
  appointments,
  onCreateAppointment,
  onEditAppointment,
}) => {
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  const getAppointmentsForSlot = (day: Date, hour: number): Appointment[] => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      return (
        aptDate.getDate() === day.getDate() &&
        aptDate.getMonth() === day.getMonth() &&
        aptDate.getFullYear() === day.getFullYear() &&
        aptDate.getHours() === hour
      );
    });
  };

  const handleSlotClick = (day: Date, hour: number) => {
    const dateTime = new Date(day);
    dateTime.setHours(hour, 0, 0, 0);
    onCreateAppointment(dateTime);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const statusObj = APPOINTMENT_STATUSES.find((s) => s.value === status);
    return statusObj?.color || 'bg-gray-100 text-gray-800';
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Hora
                </th>
                {days.map((day, index) => (
                  <th
                    key={index}
                    className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider min-w-[140px] ${
                      isToday(day) ? 'bg-blue-50 text-blue-700' : 'text-gray-500'
                    }`}
                  >
                    <div>{day.toLocaleDateString('es-ES', { weekday: 'short' })}</div>
                    <div className="text-sm font-semibold mt-1">
                      {day.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hours.map((hour) => (
                <tr key={hour}>
                  <td className="sticky left-0 bg-white px-4 py-2 text-sm text-gray-500 border-r">
                    {hour.toString().padStart(2, '0')}:00
                  </td>
                  {days.map((day, dayIndex) => {
                    const slotAppointments = getAppointmentsForSlot(day, hour);
                    return (
                      <td
                        key={dayIndex}
                        className={`px-2 py-2 align-top border-r border-b cursor-pointer hover:bg-gray-50 ${
                          isToday(day) ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => slotAppointments.length === 0 && handleSlotClick(day, hour)}
                      >
                        <div className="space-y-1">
                          {slotAppointments.map((apt) => (
                            <div
                              key={apt.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditAppointment(apt);
                              }}
                              className={`p-2 rounded text-xs cursor-pointer hover:opacity-80 ${getStatusColor(
                                apt.status
                              )}`}
                            >
                              <div className="font-semibold truncate">
                                {formatTime(apt.startTime)}
                              </div>
                              <div className="truncate">{apt.patientName || 'Paciente'}</div>
                              <div className="truncate text-gray-600">
                                {apt.dentistName || 'Dentista'}
                              </div>
                              <div className="text-gray-600">{apt.durationMinutes} min</div>
                            </div>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 bg-gray-50 border-t flex flex-wrap gap-3">
        <div className="text-xs font-medium text-gray-700 mr-2">Estados:</div>
        {APPOINTMENT_STATUSES.map((status) => (
          <div key={status.value} className="flex items-center gap-1">
            <span className={`px-2 py-1 rounded text-xs ${status.color}`}>{status.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentCalendar;
