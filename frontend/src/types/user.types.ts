export interface User {
  id: string;
  tenantId: string;
  staffId: string | null;
  staffName: string | null;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  staffId?: string;
}

export interface UpdateUserDTO {
  firstName: string;
  lastName: string;
  role: string;
}

export interface ChangePasswordDTO {
  newPassword: string;
}

export const USER_ROLES = {
  ADMIN: { label: 'Administrador', color: 'bg-purple-100 text-purple-800' },
  DENTIST: { label: 'Dentista', color: 'bg-blue-100 text-blue-800' },
  ASSISTANT: { label: 'Asistente', color: 'bg-green-100 text-green-800' }
} as const;
