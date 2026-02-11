import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { Appointment } from '../../types/appointment.types';
import Button from '../../components/common/Button';
import AppointmentModal from './AppointmentModal';
import AppointmentCalendar from './AppointmentCalendar';

const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);

  function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  useEffect(() => {
    loadAppointments();
  }, [currentWeekStart]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const startDate = currentWeekStart.toISOString().split('T')[0];
      const endDate = weekEnd.toISOString().split('T')[0];

      const data = await appointmentService.getByDateRange(startDate, endDate);
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      alert('Error al cargar citas');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const handleToday = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  const handleCreateAppointment = (dateTime?: Date) => {
    setSelectedAppointment(null);
    setSelectedDateTime(dateTime || null);
    setIsModalOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedDateTime(null);
    setIsModalOpen(true);
  };

  const handleDeleteAppointment = async (appointment: Appointment) => {
    if (!window.confirm('¿Está seguro de eliminar esta cita?')) {
      return;
    }

    try {
      await appointmentService.delete(appointment.id);
      await loadAppointments();
      alert('Cita eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Error al eliminar cita');
    }
  };

  const handleModalClose = async (refresh?: boolean) => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
    setSelectedDateTime(null);
    if (refresh) {
      await loadAppointments();
    }
  };

  const formatWeekRange = () => {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return `${currentWeekStart.toLocaleDateString('es-ES', options)} - ${weekEnd.toLocaleDateString('es-ES', options)}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handlePreviousWeek}>
                ← Anterior
              </Button>
              <Button variant="secondary" onClick={handleToday}>
                Hoy
              </Button>
              <Button variant="secondary" onClick={handleNextWeek}>
                Siguiente →
              </Button>
              <Button onClick={() => handleCreateAppointment()}>Nueva Cita</Button>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">{formatWeekRange()}</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <AppointmentCalendar
            weekStart={currentWeekStart}
            appointments={appointments}
            onCreateAppointment={handleCreateAppointment}
            onEditAppointment={handleEditAppointment}
            onDeleteAppointment={handleDeleteAppointment}
          />
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <AppointmentModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          appointment={selectedAppointment}
          initialDateTime={selectedDateTime}
        />
      )}
    </div>
  );
};

export default AppointmentsPage;
