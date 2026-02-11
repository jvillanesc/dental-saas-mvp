export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  specialty: string;
  licenseNumber: string;
  hireDate: string;
  active: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStaffDTO {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  specialty: string;
  licenseNumber: string;
  hireDate: string;
  active: boolean;
  createUser?: boolean;
  userEmail?: string;
  userPassword?: string;
  userRole?: string;
}

export interface UpdateStaffDTO {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  specialty: string;
  licenseNumber: string;
  hireDate: string;
  active: boolean;
}

export const SPECIALTIES = [
  'GENERAL',
  'ENDODONCIA',
  'PERIODONCIA',
  'ORTODONCIA',
  'CIRUGIA',
  'IMPLANTOLOGIA',
  'PEDIATRIA',
  'ESTETICA',
] as const;
