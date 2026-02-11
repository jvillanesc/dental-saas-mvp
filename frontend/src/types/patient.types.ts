export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePatientDTO {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate: string;
}

export interface UpdatePatientDTO extends CreatePatientDTO {}
