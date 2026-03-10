import api from './api';
import { Appointment, CreateAppointmentDTO, UpdateAppointmentDTO } from '../types/appointment.types';

interface AppointmentFilters {
  dentistId?: string;
  startDate?: string;
  endDate?: string;
}

export const appointmentService = {
  getAll: async (filters?: AppointmentFilters): Promise<Appointment[]> => {
    const response = await api.get('/appointments', {
      params: filters,
    });
    return response.data;
  },

  getByDateRange: async (startDate: string, endDate: string, dentistId?: string): Promise<Appointment[]> => {
    const response = await api.get('/appointments', {
      params: { startDate, endDate, dentistId },
    });
    return response.data;
  },

  getById: async (id: string): Promise<Appointment> => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  create: async (data: CreateAppointmentDTO): Promise<Appointment> => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  update: async (id: string, data: UpdateAppointmentDTO): Promise<Appointment> => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/appointments/${id}`);
  },

  updateStatus: async (id: string, status: string): Promise<Appointment> => {
    const response = await api.patch(`/appointments/${id}/status`, { status });
    return response.data;
  },
};
