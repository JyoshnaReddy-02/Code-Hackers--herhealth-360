export interface User {
  id: number;
  email: string;
  display_name: string;
  date_of_birth?: string | null;
  life_stage?: string;
  created_at?: string;
}

export interface SymptomEntry {
  id: number;
  user_id: number;
  recorded_at: string;
  category: string;
  symptom_name: string;
  severity: number;
  duration_hours?: number | null;
  notes?: string | null;
  cycle_day?: number | null;
  sleep_quality?: number | null;
  activity_level?: string | null;
  fatigue_level?: number | null;
  mood?: string | null;
  triggers?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AvailabilitySlot {
  id: number;
  doctor_id: number;
  doctor_name?: string;
  doctor_specialty?: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  booked_by_user?: {
    user_id: number;
    user_name: string;
    user_email: string;
  } | null;
}

export interface Doctor {
  id: number;
  name: string;
  email?: string;
  specialty: string;
  bio: string;
  is_demo: boolean;
  is_active: boolean;
  available_slots_count?: number;
  available_slots?: AvailabilitySlot[];
  disclaimer?: string;
}

export interface DoctorAppointmentItem {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  user_life_stage?: string;
  appointment_time: string;
  appointment_type: 'video' | 'in_person';
  status: 'booked' | 'cancelled' | 'completed';
  notes?: string | null;
  slot_id: number | null;
  created_at: string;
  jitsi_room_url?: string;
}

export interface Appointment {
  id: number;
  user_id: number;
  doctor_id: number;
  doctor_name: string;
  doctor_specialty: string;
  is_demo_doctor: boolean;
  slot_id: number | null;
  appointment_time: string;
  appointment_type: 'video' | 'in_person';
  status: 'booked' | 'cancelled' | 'completed';
  notes?: string | null;
  created_at: string;
  jitsi_room_url?: string;
  video_notice?: string;
}

export interface HealthResource {
  id: number;
  title: string;
  slug: string;
  topic: string;
  life_stage: string;
  summary: string;
  overview: string;
  signs_and_symptoms?: string | null;
  when_to_seek_care: string;
  self_care_info: string;
  common_misconceptions?: string | null;
  trusted_source: string;
  source_url: string;
  last_reviewed: string;
  disclaimer: string;
}

export interface AnalyticsResponse {
  total_entries: number;
  average_severity: number;
  peak_severity: number;
  timeline: Array<{
    id: number;
    date: string;
    label: string;
    symptom: string;
    category: string;
    severity: number;
    duration: number;
  }>;
  frequency_by_date: Array<{
    date: string;
    count: number;
  }>;
  category_distribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  wellness_correlation: Array<{
    date: string;
    label: string;
    symptom: string;
    severity: number;
    sleep_quality?: number | null;
    fatigue_level?: number | null;
    activity_level?: string;
  }>;
  disclaimer: string;
}

export interface NavigatorResponse {
  is_emergency: boolean;
  urgency_level: 'CRITICAL_EMERGENCY' | 'EDUCATIONAL_GUIDANCE' | 'GENERAL_EDUCATION';
  title: string;
  message?: string;
  emergency_actions?: string[];
  category?: string;
  educational_summary?: string;
  key_insights?: string[];
  when_to_seek_care?: string[];
  self_care_tips?: string[];
  topics_matched?: string[];
  recommended_exercises?: ExercisePractice[];
  suggested_specialty?: string;
  related_slug?: string;
  trusted_sources?: Array<{ title: string; url: string }>;
  disclaimer: string;
}

export interface ExercisePractice {
  id: number;
  title: string;
  category: string;
  target_condition: string;
  duration_minutes: number;
  difficulty: string;
  description: string;
  instructions: string;
  image_url: string;
  youtube_url: string;
  website_url?: string | null;
  source_reference: string;
  created_at: string;
}

export interface AdminOverviewResponse {
  metrics: {
    total_users: number;
    total_doctors: number;
    total_appointments: number;
    total_symptoms_logged: number;
    total_exercises: number;
  };
  life_stage_distribution: Array<{ stage: string; count: number }>;
  appointment_status_distribution: Array<{ status: string; count: number }>;
}

export interface AdminUserProblemsResponse {
  total_observations: number;
  top_symptoms: Array<{
    symptom: string;
    category: string;
    report_count: number;
    avg_severity: number;
    max_severity: number;
  }>;
  category_distribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  severity_distribution: Array<{
    tier: string;
    count: number;
    percentage: number;
    color: string;
  }>;
}

export interface AdminDoctorQuestionsResponse {
  total_consultation_inquiries: number;
  theme_distribution: Array<{
    theme: string;
    count: number;
    percentage: number;
  }>;
  recent_inquiries: Array<{
    appointment_id: number;
    user_name: string;
    user_life_stage: string;
    doctor_name: string;
    doctor_specialty: string;
    theme: string;
    user_notes: string;
    appointment_time: string;
    status: string;
  }>;
}
