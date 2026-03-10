import api from './api';
import { MedicalHistory, CreateMedicalHistoryDTO } from '../types/medicalHistory.types';

export const medicalHistoryService = {
  async getByPatientId(patientId: string): Promise<MedicalHistory | null> {
    try {
      const response = await api.get<MedicalHistory>(`/patients/${patientId}/medical-history`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No medical history yet
      }
      throw error;
    }
  },
  
  async createOrUpdate(patientId: string, data: CreateMedicalHistoryDTO): Promise<MedicalHistory> {
    const response = await api.post<MedicalHistory>(`/patients/${patientId}/medical-history`, data);
    return response.data;
  },
  
  async delete(patientId: string): Promise<void> {
    await api.delete(`/patients/${patientId}/medical-history`);
  }
};
