import api from './api';
import { Appointment, CreateAppointmentDTO, UpdateAppointmentDTO } from '../types/appointment.types';

export const appointmentService = {
  getAll: async (): Promise<Appointment[]> => {
    const response = await api.get('/appointments');
    return response.data;
  },

  getByDateRange: async (startDate: string, endDate: string): Promise<Appointment[]> => {
    const response = await api.get('/appointments', {
      params: { startDate, endDate },
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
};
