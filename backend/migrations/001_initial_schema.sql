CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  full_name VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'user',
  timezone VARCHAR DEFAULT 'America/Sao_Paulo',
  locale VARCHAR DEFAULT 'pt-BR',
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  age_range VARCHAR,
  biological_sex_optional VARCHAR,
  height_cm_optional INTEGER,
  weight_kg_optional DECIMAL,
  fitness_level VARCHAR DEFAULT 'sedentary',
  travel_frequency VARCHAR DEFAULT 'rarely',
  primary_goal VARCHAR,
  secondary_goals_json JSONB DEFAULT '[]',
  dietary_preferences_json JSONB DEFAULT '[]',
  dietary_restrictions_json JSONB DEFAULT '[]',
  physical_limitations_json JSONB DEFAULT '[]',
  preferred_workout_types_json JSONB DEFAULT '[]',
  preferred_meal_style_json VARCHAR DEFAULT 'balanced',
  sleep_goal_hours_optional DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES users(id),
  checkin_date DATE NOT NULL,
  energy_level SMALLINT CHECK (energy_level >= 1 AND energy_level <= 5),
  stress_level SMALLINT CHECK (stress_level >= 1 AND stress_level <= 5),
  sleep_quality SMALLINT CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  available_minutes INTEGER,
  context_type VARCHAR,
  location_context_json JSONB DEFAULT '{}',
  meal_windows_json JSONB DEFAULT '[]',
  equipment_access_json JSONB DEFAULT '[]',
  notes_optional TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, checkin_date)
);

CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES users(id),
  checkin_id UUID REFERENCES daily_checkins(id),
  recommendation_type VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  summary TEXT,
  rationale TEXT,
  payload_json JSONB DEFAULT '{}',
  intensity_level_optional VARCHAR,
  status VARCHAR DEFAULT 'active',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ
);

CREATE TABLE recommendation_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES users(id),
  recommendation_id UUID NOT NULL REFERENCES recommendations(id),
  feedback_type VARCHAR NOT NULL,
  score_optional SMALLINT,
  reason_code_optional VARCHAR,
  comment_optional TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id UUID NOT NULL REFERENCES users(id),
  reminder_type VARCHAR NOT NULL,
  schedule_json JSONB DEFAULT '{}',
  channel VARCHAR DEFAULT 'in_app',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id_optional UUID,
  entity_type VARCHAR NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR NOT NULL,
  before_json_optional JSONB,
  after_json_optional JSONB,
  request_id VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_checkins_tenant_user_date ON daily_checkins (tenant_id, user_id, checkin_date DESC);
CREATE INDEX idx_recommendations_tenant_user_generated ON recommendations (tenant_id, user_id, generated_at DESC);
CREATE INDEX idx_recommendations_tenant_type_status ON recommendations (tenant_id, recommendation_type, status);
CREATE INDEX idx_audit_logs_tenant_created ON audit_logs (tenant_id, created_at DESC);
CREATE INDEX idx_audit_logs_tenant_user ON audit_logs (tenant_id, user_id_optional);
