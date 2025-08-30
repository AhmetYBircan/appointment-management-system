export interface Patient {
  id: string;
  name: string;
  phoneNumber: string;
  mail?: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
}

export interface CreatePatientDto {
  name: string;
  phoneNumber: string;
  mail?: string;
}

export interface UpdatePatientDto {
  name?: string;
  phoneNumber?: string;
  mail?: string;
} 