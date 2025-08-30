import type { Patient } from './patient';
import type { Category } from './category';

export interface Appointment {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  notes: string;
  patientId?: string;
  patient?: Patient;
  categoryId?: string;
  category?: Category;
  categoryName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentDto {
  title: string;
  startTime: string;
  endTime: string;
  notes?: string;
  patientId: string | null;
  categoryId: string | null;
} 