export interface Appointment {
  id: string;
  patientId: string;
  dentistId: string;
  startTime: string;
  durationMinutes: number;
  status: string;
  notes?: string;
  patientName?: string;
  dentistName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAppointmentDTO {
  patientId: string;
  dentistId: string;
  startTime: string;
  durationMinutes: number;
  status: string;
  notes?: string;
}

export interface UpdateAppointmentDTO extends CreateAppointmentDTO {}

export const APPOINTMENT_STATUSES = [
  { value: 'SCHEDULED', label: 'Programada', color: 'bg-blue-100 text-blue-800' },
  { value: 'CONFIRMED', label: 'Confirmada', color: 'bg-green-100 text-green-800' },
  { value: 'IN_PROGRESS', label: 'En Progreso', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'COMPLETED', label: 'Completada', color: 'bg-gray-100 text-gray-800' },
  { value: 'CANCELLED', label: 'Cancelada', color: 'bg-red-100 text-red-800' },
  { value: 'NO_SHOW', label: 'No Asistió', color: 'bg-orange-100 text-orange-800' },
] as const;
