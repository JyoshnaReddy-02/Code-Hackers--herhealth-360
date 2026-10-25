import {
  User,
  SymptomEntry,
  Doctor,
  AvailabilitySlot,
  Appointment,
  HealthResource,
  AnalyticsResponse,
  NavigatorResponse,
  DoctorAppointmentItem,
  ExercisePractice,
  AdminOverviewResponse,
  AdminUserProblemsResponse,
  AdminDoctorQuestionsResponse,
} from '../types';

const resolveApiBase = (): string => {
  const envUrl = (import.meta.env.VITE_API_BASE_URL as string)?.trim();
  if (!envUrl) {
    return '/api/v1';
  }
  const cleanUrl = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  return cleanUrl.endsWith('/api/v1') ? cleanUrl : `${cleanUrl}/api/v1`;
};

const API_BASE = resolveApiBase();

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('herhealth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('herhealth_token', token);
    } else {
      localStorage.removeItem('herhealth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error || `HTTP error ${response.status}: ${response.statusText}`;
      const err = new Error(errorMsg);
      (err as any).status = response.status;
      (err as any).data = data;
      throw err;
    }

    return data as T;
  }

  // System Health
  async getHealth() {
    return this.request<{ status: string; database_connected: boolean }>('/health');
  }

  // Auth
  async register(payload: { email: string; password: string; display_name: string; date_of_birth?: string; life_stage?: string }) {
    const res = await this.request<{ message: string; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    return res;
  }

  async login(payload: { email: string; password: string }) {
    const res = await this.request<{ message: string; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    return res;
  }

  async resetPassword(payload: { email: string; new_password: string }) {
    const res = await this.request<{ message: string; token: string; user: User }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    return res;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getMe() {
    return this.request<{ user: User }>('/auth/me');
  }

  // Profile
  async getProfile() {
    return this.request<{ profile: User }>('/profile');
  }

  async updateProfile(payload: { display_name?: string; date_of_birth?: string; life_stage?: string }) {
    return this.request<{ message: string; profile: User }>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // Symptoms
  async getSymptoms(params?: { category?: string; start_date?: string; end_date?: string; min_severity?: number; max_severity?: number }) {
    const query = new URLSearchParams();
    if (params) {
      if (params.category) query.append('category', params.category);
      if (params.start_date) query.append('start_date', params.start_date);
      if (params.end_date) query.append('end_date', params.end_date);
      if (params.min_severity !== undefined) query.append('min_severity', params.min_severity.toString());
      if (params.max_severity !== undefined) query.append('max_severity', params.max_severity.toString());
    }
    const qStr = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ count: number; symptoms: SymptomEntry[] }>(`/symptoms${qStr}`);
  }

  async createSymptom(payload: Partial<SymptomEntry>) {
    return this.request<{ message: string; symptom: SymptomEntry }>('/symptoms', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getSymptom(id: number) {
    return this.request<{ symptom: SymptomEntry }>(`/symptoms/${id}`);
  }

  async updateSymptom(id: number, payload: Partial<SymptomEntry>) {
    return this.request<{ message: string; symptom: SymptomEntry }>(`/symptoms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteSymptom(id: number) {
    return this.request<{ message: string }>(`/symptoms/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async getSymptomAnalytics() {
    return this.request<AnalyticsResponse>('/analytics/symptoms');
  }

  // Doctors
  async getDoctors(specialty?: string) {
    const qStr = specialty ? `?specialty=${encodeURIComponent(specialty)}` : '';
    return this.request<{ doctors: Doctor[]; notice: string }>(`/doctors${qStr}`);
  }

  async getDoctor(id: number) {
    return this.request<{ doctor: Doctor }>(`/doctors/${id}`);
  }

  async getDoctorSlots(doctorId: number) {
    return this.request<{ doctor_id: number; doctor_name: string; slots: AvailabilitySlot[] }>(`/doctors/${doctorId}/slots`);
  }

  // Appointments
  async getAppointments(status?: string) {
    const qStr = status ? `?status=${encodeURIComponent(status)}` : '';
    return this.request<{ appointments: Appointment[] }>(`/appointments${qStr}`);
  }

  async bookAppointment(payload: { slot_id: number; appointment_type: 'video' | 'in_person'; notes?: string }) {
    return this.request<{ message: string; appointment: Appointment }>('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async cancelAppointment(id: number) {
    return this.request<{ message: string; appointment: Appointment }>(`/appointments/${id}/cancel`, {
      method: 'POST',
    });
  }

  async rescheduleAppointment(id: number, newSlotId: number) {
    return this.request<{ message: string; appointment: Appointment }>(`/appointments/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ new_slot_id: newSlotId }),
    });
  }

  // Navigator
  async queryNavigator(query: string, topic?: string) {
    return this.request<NavigatorResponse>('/navigator', {
      method: 'POST',
      body: JSON.stringify({ query, topic }),
    });
  }

  // Resources & Library
  async getHealthTopics() {
    return this.request<{ topics: Array<{ id: string; title: string; description: string }> }>('/health-topics');
  }

  async getResources(params?: { topic?: string; life_stage?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params) {
      if (params.topic) query.append('topic', params.topic);
      if (params.life_stage) query.append('life_stage', params.life_stage);
      if (params.search) query.append('search', params.search);
    }
    const qStr = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ count: number; resources: HealthResource[] }>(`/resources${qStr}`);
  }

  async getResource(slugOrId: string | number) {
    return this.request<{ resource: HealthResource }>(`/resources/${slugOrId}`);
  }

  async getMotherCare() {
    return this.request<{ title: string; description: string; disclaimer: string; resources: HealthResource[] }>('/mothercare');
  }

  async getWellness() {
    return this.request<{ title: string; disclaimer: string; resources: HealthResource[] }>('/wellness');
  }

  // Download Health Passport PDF
  async downloadHealthPassport(startDate?: string, endDate?: string): Promise<Blob> {
    const query = new URLSearchParams();
    if (startDate) query.append('start_date', startDate);
    if (endDate) query.append('end_date', endDate);
    const qStr = query.toString() ? `?${query.toString()}` : '';

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}/health-passport.pdf${qStr}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to download Health Passport (HTTP ${response.status})`);
    }

    return response.blob();
  }

  // Doctor Portal Methods
  async doctorLogin(credentials: { email: string; password: string }) {
    const res = await this.request<{
      message: string;
      token: string;
      role: string;
      doctor: Doctor;
    }>('/doctor/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(res.token);
    return res;
  }

  async getDoctorMe() {
    return this.request<{ doctor: Doctor }>('/doctor/me');
  }

  async getDoctorAppointments() {
    return this.request<{ appointments: DoctorAppointmentItem[] }>('/doctor/appointments');
  }

  async getDoctorPortalSlots() {
    return this.request<{ slots: AvailabilitySlot[] }>('/doctor/slots');
  }

  async addDoctorSlot(payload: { start_time: string; end_time?: string }) {
    return this.request<{ message: string; slot: AvailabilitySlot }>('/doctor/slots', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async deleteDoctorSlot(slotId: number) {
    return this.request<{ message: string }>(`/doctor/slots/${slotId}`, {
      method: 'DELETE',
    });
  }

  // Public Exercises
  async getPublicExercises(category?: string) {
    const qStr = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return this.request<{ exercises: ExercisePractice[] }>(`/exercises${qStr}`);
  }

  // Admin Portal Methods
  async adminLogin(credentials: { email: string; password: string }) {
    const res = await this.request<{
      message: string;
      token: string;
      role: string;
      admin: { email: string; display_name: string; role: string };
    }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(res.token);
    return res;
  }

  async getAdminOverview() {
    return this.request<AdminOverviewResponse>('/admin/overview');
  }

  async getAdminUserProblems() {
    return this.request<AdminUserProblemsResponse>('/admin/user-problems');
  }

  async getAdminDoctorQuestions() {
    return this.request<AdminDoctorQuestionsResponse>('/admin/doctor-questions');
  }

  async getAdminExercises() {
    return this.request<{ exercises: ExercisePractice[] }>('/admin/exercises');
  }

  async addAdminExercise(payload: Partial<ExercisePractice>) {
    return this.request<{ message: string; exercise: ExercisePractice }>('/admin/exercises', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async deleteAdminExercise(id: number) {
    return this.request<{ message: string }>(`/admin/exercises/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
