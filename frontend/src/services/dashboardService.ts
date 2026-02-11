import api from './api';

export interface DashboardStats {
  totalPatients: number;
  activeStaff: number;
  appointmentsToday: number;
  appointmentsPending: number;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },
};
