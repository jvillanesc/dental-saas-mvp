import api from './api';
import { Staff, CreateStaffDTO, UpdateStaffDTO } from '../types/staff.types';

export const staffService = {
  getAll: async (): Promise<Staff[]> => {
    const response = await api.get('/staff');
    return response.data;
  },

  getById: async (id: string): Promise<Staff> => {
    const response = await api.get(`/staff/${id}`);
    return response.data;
  },

  getDentists: async (): Promise<Staff[]> => {
    const response = await api.get('/dentists');
    return response.data;
  },

  create: async (data: CreateStaffDTO): Promise<Staff> => {
    const response = await api.post('/staff', data);
    return response.data;
  },

  update: async (id: string, data: UpdateStaffDTO): Promise<Staff> => {
    const response = await api.put(`/staff/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/staff/${id}`);
  },
};
