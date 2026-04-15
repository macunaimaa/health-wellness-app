import { generateUniqueEmail, registerUser } from "./helpers";

const DEFAULT_PASSWORD = "TestPass123!";

interface TenantOverrides {
  id?: string;
  name?: string;
}

export function createTenant(overrides: TenantOverrides = {}) {
  return {
    id: overrides.id || `tenant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: overrides.name || "Test Tenant",
    ...overrides,
  };
}

interface UserOverrides {
  email?: string;
  password?: string;
  name?: string;
  role?: string;
}

export async function createUser(
  tenantId: string,
  overrides: UserOverrides = {}
) {
  const email = overrides.email || generateUniqueEmail();
  const password = overrides.password || DEFAULT_PASSWORD;
  const name = overrides.name || "Test User";

  const result = await registerUser(email, password, name, tenantId);

  return {
    id: result.user?.id,
    email,
    password,
    name,
    tenantId,
    role: overrides.role || result.user?.role || "user",
    token: result.token,
  };
}

interface ProfileOverrides {
  fitness_level?: string;
  goal?: string;
  dietary_restrictions?: string[];
  physical_limitations?: string[];
  age?: number;
  weight?: number;
  height?: number;
}

export function createProfileData(
  _userId: string,
  _tenantId: string,
  overrides: ProfileOverrides = {}
) {
  return {
    fitness_level: "intermediate",
    goal: "general_health",
    dietary_restrictions: [],
    physical_limitations: [],
    age: 30,
    weight: 70,
    height: 175,
    ...overrides,
  };
}

interface CheckinOverrides {
  energy_level?: number;
  stress_level?: number;
  sleep_quality?: number;
  mood?: number;
  context_type?: string;
  available_minutes?: number;
  notes?: string;
}

export function createCheckinData(
  _userId: string,
  _tenantId: string,
  overrides: CheckinOverrides = {}
) {
  return {
    energy_level: 3,
    stress_level: 2,
    sleep_quality: 3,
    mood: 3,
    context_type: "home",
    available_minutes: 30,
    notes: "",
    ...overrides,
  };
}

interface RecommendationOverrides {
  type?: string;
  title?: string;
  summary?: string;
  rationale?: string;
  intensity?: string;
  estimated_minutes?: number;
  status?: string;
}

export function createRecommendationData(
  _userId: string,
  _tenantId: string,
  _checkinId: string,
  overrides: RecommendationOverrides = {}
) {
  return {
    type: "workout",
    title: "Test Recommendation",
    summary: "Test summary",
    rationale: "Test rationale",
    intensity: "moderate",
    estimated_minutes: 20,
    status: "active",
    ...overrides,
  };
}

interface FeedbackOverrides {
  type?: string;
  rating?: number;
  comment?: string;
}

export function createFeedbackData(
  _userId: string,
  _tenantId: string,
  _recommendationId: string,
  overrides: FeedbackOverrides = {}
) {
  return {
    type: "positive",
    rating: 4,
    comment: "Good recommendation",
    ...overrides,
  };
}
