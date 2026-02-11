import api from './api';
import { User, CreateUserDTO, UpdateUserDTO, ChangePasswordDTO } from '../types/user.types';

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  create: async (user: CreateUserDTO): Promise<User> => {
    const response = await api.post('/users', user);
    return response.data;
  },

  update: async (id: string, user: UpdateUserDTO): Promise<User> => {
    const response = await api.put(`/users/${id}`, user);
    return response.data;
  },

  changePassword: async (id: string, data: ChangePasswordDTO): Promise<void> => {
    await api.put(`/users/${id}/password`, data);
  },

  deactivate: async (id: string): Promise<void> => {
    await api.put(`/users/${id}/deactivate`);
  },

  activate: async (id: string): Promise<void> => {
    await api.put(`/users/${id}/activate`);
  },

  linkStaff: async (userId: string, staffId: string): Promise<void> => {
    await api.post(`/users/${userId}/link-staff/${staffId}`);
  },

  unlinkStaff: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}/unlink-staff`);
  }
};
