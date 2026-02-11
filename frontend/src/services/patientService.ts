import api from './api';
import { Patient, CreatePatientDTO, UpdatePatientDTO } from '../types/patient.types';

export const patientService = {
  getAll: async (): Promise<Patient[]> => {
    const response = await api.get('/patients');
    return response.data;
  },

  getById: async (id: string): Promise<Patient> => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  create: async (data: CreatePatientDTO): Promise<Patient> => {
    const response = await api.post('/patients', data);
    return response.data;
  },

  update: async (id: string, data: UpdatePatientDTO): Promise<Patient> => {
    const response = await api.put(`/patients/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/patients/${id}`);
  },
};
