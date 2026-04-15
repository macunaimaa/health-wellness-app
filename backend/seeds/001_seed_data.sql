-- Tenant demo
INSERT INTO tenants (id, name, status) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Demo Corp', 'active');

-- Usuários demo (senha: demo123)
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, timezone, locale, status) VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@democorp.com', '$2b$10$rTOe4.QggIlq472V5wyAFeH48c4Wn7XcyM7zXHE36SBv/NU47w6bW', 'Admin Demo', 'admin', 'America/Sao_Paulo', 'pt-BR', 'active'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'carlos@democorp.com', '$2b$10$rTOe4.QggIlq472V5wyAFeH48c4Wn7XcyM7zXHE36SBv/NU47w6bW', 'Carlos Silva', 'user', 'America/Sao_Paulo', 'pt-BR', 'active');

-- Perfil do usuário demo
INSERT INTO user_profiles (id, tenant_id, user_id, age_range, biological_sex_optional, height_cm_optional, weight_kg_optional, fitness_level, travel_frequency, primary_goal, secondary_goals_json, dietary_preferences_json, dietary_restrictions_json, physical_limitations_json, preferred_workout_types_json, preferred_meal_style_json, sleep_goal_hours_optional) VALUES
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '35-44', 'male', 178, 82.5, 'light', 'weekly', 'energy', '["weight_loss", "stress_reduction"]', '["mediterranean", "high_protein"]', '["lactose_intolerant"]', '[]', '["walking", "bodyweight", "swimming"]', 'balanced', 7.5);

-- Lembretes padrão
INSERT INTO reminders (id, tenant_id, user_id, reminder_type, schedule_json, channel, active) VALUES
  ('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a71', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'hydration', '{"times": ["09:00", "11:00", "14:00", "16:00", "18:00"]}', 'in_app', true),
  ('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a72', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'movement', '{"times": ["10:00", "15:00"]}', 'in_app', true),
  ('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a73', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'meal', '{"times": ["07:00", "12:00", "19:30"]}', 'in_app', true),
  ('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a74', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'recovery', '{"times": ["22:00"]}', 'in_app', true),
  ('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a75', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'workout', '{"times": ["06:30"], "days": ["monday", "wednesday", "friday"]}', 'in_app', true);

-- Check-ins e recomendações são gerados pelo usuário via check-in real + OpenAI
