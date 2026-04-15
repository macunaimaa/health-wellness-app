import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
  requestId?: string;
}

export interface JwtPayload {
  userId: string;
  tenantId: string;
  role: 'user' | 'admin';
}

export interface TenantEntity {
  tenant_id: string;
}

export interface UserRow extends TenantEntity {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
  timezone: string;
  locale: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfileRow extends TenantEntity {
  id: string;
  user_id: string;
  age_range: string | null;
  biological_sex_optional: string | null;
  height_cm_optional: number | null;
  weight_kg_optional: number | null;
  fitness_level: string;
  travel_frequency: string;
  primary_goal: string | null;
  secondary_goals_json: string[];
  dietary_preferences_json: string[];
  dietary_restrictions_json: string[];
  physical_limitations_json: string[];
  preferred_workout_types_json: string[];
  preferred_meal_style_json: string;
  sleep_goal_hours_optional: number | null;
  created_at: string;
  updated_at: string;
}

export interface DailyCheckinRow extends TenantEntity {
  id: string;
  user_id: string;
  checkin_date: string;
  energy_level: number;
  stress_level: number;
  sleep_quality: number;
  available_minutes: number | null;
  context_type: string | null;
  location_context_json: Record<string, unknown>;
  meal_windows_json: MealWindow[];
  equipment_access_json: string[];
  notes_optional: string | null;
  created_at: string;
}

export interface MealWindow {
  start: string;
  end: string;
}

export interface RecommendationRow extends TenantEntity {
  id: string;
  user_id: string;
  checkin_id: string | null;
  recommendation_type: string;
  title: string;
  summary: string | null;
  rationale: string | null;
  payload_json: Record<string, unknown>;
  intensity_level_optional: string | null;
  status: string;
  generated_at: string;
  valid_until: string | null;
}

export interface RecommendationFeedbackRow extends TenantEntity {
  id: string;
  user_id: string;
  recommendation_id: string;
  feedback_type: string;
  score_optional: number | null;
  reason_code_optional: string | null;
  comment_optional: string | null;
  created_at: string;
}

export interface ReminderRow extends TenantEntity {
  id: string;
  user_id: string;
  reminder_type: string;
  schedule_json: Record<string, unknown>;
  channel: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLogRow extends TenantEntity {
  id: string;
  user_id_optional: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  before_json_optional: Record<string, unknown> | null;
  after_json_optional: Record<string, unknown> | null;
  request_id: string;
  created_at: string;
}

export interface GenerateRecommendationsInput {
  userId: string;
  tenantId: string;
  checkin: DailyCheckinRow;
  profile: UserProfileRow;
  recentRecommendations: RecommendationRow[];
  recentFeedback: RecommendationFeedbackRow[];
  daysSinceLastActivity: number;
}

export interface GeneratedRecommendation {
  recommendation_type: string;
  title: string;
  summary: string;
  rationale: string;
  payload_json: Record<string, unknown>;
  intensity_level_optional: string | null;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
