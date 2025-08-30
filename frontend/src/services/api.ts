import axios from 'axios';
import type { Appointment, CreateAppointmentDto } from '../types/appointment';
import type { Patient, CreatePatientDto, UpdatePatientDto } from '../types/patient';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../types/category';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Request interceptor: login/register dışındaki isteklere token ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.url && !config.url.includes('/login') && !config.url.includes('/register')) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: 401 hatası alındığında login'e yönlendir
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const apiFunctions = {
  // Appointment endpoints
  async getAllAppointments(): Promise<Appointment[]> {
    const response = await api.get('/calendar');
    return response.data;
  },

  async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<Appointment[]> {
    const response = await api.get('/calendar/range', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  async createAppointment(appointment: CreateAppointmentDto): Promise<Appointment> {
    const response = await api.post('/calendar', appointment);
    return response.data;
  },

  async updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment> {
    const response = await api.patch(`/calendar/${id}`, appointment);
    return response.data;
  },

  async deleteAppointment(id: string): Promise<void> {
    await api.delete(`/calendar/${id}`);
  },

  // Patient endpoints
  async createPatient(patient: CreatePatientDto): Promise<Patient> {
    const response = await api.post('/patients', patient);
    return response.data;
  },

  async updatePatient(id: string, patient: UpdatePatientDto): Promise<Patient> {
    const response = await api.patch(`/patients/${id}`, patient);
    return response.data;
  },

  async deletePatient(id: string): Promise<void> {
    await api.delete(`/patients/${id}`);
  },

  async getAllPatients(): Promise<Patient[]> {
    const response = await api.get('/patients');
    return response.data;
  },

  async searchPatients(query: string): Promise<Patient[]> {
    const response = await api.get('/patients', {
      params: { name: query },
    });
    return response.data;
  },

  async getPatientById(id: string): Promise<Patient> {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  // Category endpoints
  async createCategory(category: CreateCategoryDto): Promise<Category> {
    const response = await api.post('/categories', category);
    return response.data;
  },

  async updateCategory(id: string, category: UpdateCategoryDto): Promise<Category> {
    const response = await api.patch(`/categories/${id}`, category);
    return response.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },

  async getAllCategories(): Promise<Category[]> {
    const response = await api.get('/categories');
    return response.data;
  },

  async getCategoryById(id: string): Promise<Category> {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  async filterAppointments({ patientId, startDate, endDate, categoryName }: { patientId?: string; startDate?: string; endDate?: string; categoryName?: string }): Promise<Appointment[]> {
    const response = await api.get('/calendar/filter', {
      params: { patientId, startDate, endDate, categoryName },
    });
    return response.data;
  },

  async getCategoryCountsByDay(date: string): Promise<{ id: string, name: string, type: string, count: number }[]> {
    const response = await api.get('/calendar/category-counts', {
      params: { date },
    });
    return response.data;
  },

  // User endpoints
  async createUser(userData: { name: string; password: string; phoneNumber?: string; mail?: string; type: string }): Promise<any> {
    const response = await api.post('/users/newUser', userData);
    return response.data;
  },

  async updateUser(id: string, userData: { name?: string; phoneNumber?: string; mail?: string; type?: string; status?: string }): Promise<any> {
    const response = await api.patch(`/users/id/${id}`, userData);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/id/${id}`);
  },

  async getAllUsers(): Promise<any[]> {
    const response = await api.get('/users');
    return response.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<any> {
    const response = await api.patch('/users/change-password', data);
    return response.data;
  },

  async updateProfile(data: { name: string; mail?: string; phoneNumber?: string }): Promise<any> {
    const response = await api.patch('/users/profile', data);
    return response.data;
  },

  async getCurrentUser(): Promise<any> {
    const response = await api.get('/users/profile');
    return response.data;
  },

  async logout(): Promise<any> {
    const response = await api.post('/users/logout');
    return response.data;
  },
}; 