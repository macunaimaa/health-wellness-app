export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  tenantId: string;
  profileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  tenantId: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Profile {
  id: string;
  userId: string;
  primaryGoal: PrimaryGoal;
  dietaryRestrictions: DietaryRestriction[];
  physicalLimitations: PhysicalLimitation[];
  fitnessLevel: FitnessLevel;
  travelFrequency: TravelFrequency;
  preferredWorkoutTypes: WorkoutType[];
  mealStyle: MealStyle;
  completedAt: string;
}

export type PrimaryGoal =
  | 'energia'
  | 'perda_de_peso'
  | 'manutencao'
  | 'sono'
  | 'consistencia'
  | 'reducao_estresse';

export type DietaryRestriction =
  | 'vegetariano'
  | 'vegano'
  | 'sem_gluten'
  | 'sem_lactose'
  | 'sem_frutos_do_mar'
  | 'sem_nozes'
  | 'diabetes'
  | 'low_carb'
  | 'outro';

export type PhysicalLimitation =
  | 'lesao_ombro'
  | 'lesao_joelho'
  | 'lesao_costas'
  | 'problema_cardiaco'
  | 'gestante'
  | 'pos_cirurgico'
  | 'nenhuma';

export type FitnessLevel = 'iniciante' | 'intermediario' | 'avancado';

export type TravelFrequency = 'nunca' | 'raramente' | 'mensalmente' | 'semanalmente' | 'frequentemente';

export type WorkoutType =
  | 'corrida'
  | 'musculacao'
  | 'yoga'
  | 'funcional'
  | 'natacao'
  | 'ciclismo'
  | 'alongamento'
  | 'meditacao';

export type MealStyle = 'rapido_simples' | 'equilibrado' | 'gourmet' | 'performance';

export interface CreateProfileRequest {
  primaryGoal: PrimaryGoal;
  dietaryRestrictions: DietaryRestriction[];
  physicalLimitations: PhysicalLimitation[];
  fitnessLevel: FitnessLevel;
  travelFrequency: TravelFrequency;
  preferredWorkoutTypes: WorkoutType[];
  mealStyle: MealStyle;
}

export type DayContext = 'casa' | 'escritorio' | 'aeroporto' | 'hotel' | 'carro' | 'reunioes';

export interface CheckinRequest {
  energyLevel: number;
  stressLevel: number;
  sleepQuality: number;
  availableTime: number;
  dayContext: DayContext;
  equipmentAccess: string[];
  notes?: string;
}

export interface Checkin {
  id: string;
  userId: string;
  energyLevel: number;
  stressLevel: number;
  sleepQuality: number;
  availableTime: number;
  dayContext: DayContext;
  equipmentAccess: string[];
  notes: string;
  createdAt: string;
}

export type RecommendationType = 'meal' | 'workout' | 'recovery' | 'hydration';

export type RecommendationStatus = 'pending' | 'accepted' | 'completed' | 'dismissed';

export type Intensity = 'leve' | 'moderado' | 'intenso';

export interface Recommendation {
  id: string;
  checkinId: string;
  type: RecommendationType;
  title: string;
  summary: string;
  rationale: string;
  intensity?: Intensity;
  status: RecommendationStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  expiresAt: string;
}

export interface PlanResponse {
  checkin: Checkin;
  recommendations: Recommendation[];
}

export interface FeedbackRequest {
  status: RecommendationStatus;
}

export type ReminderType = 'hydration' | 'movement' | 'meal' | 'recovery' | 'workout';

export interface ReminderConfig {
  hydration: boolean;
  movement: boolean;
  meal: boolean;
  recovery: boolean;
  workout: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminStats {
  totalUsers: number;
  activeToday: number;
  recommendationsGenerated: number;
  completionRate: number;
}

export interface HistoryEntry {
  date: string;
  checkin: Checkin | null;
  completedRecommendations: number;
  totalRecommendations: number;
}
