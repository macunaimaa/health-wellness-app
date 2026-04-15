import { query } from '../config/database';
import { UserProfileRow } from '../models/types';
import { parseJsonField } from '../utils/helpers';

export class ProfileRepository {
  async findByUserId(userId: string, tenantId: string): Promise<UserProfileRow | null> {
    const result = await query(
      'SELECT * FROM user_profiles WHERE user_id = $1 AND tenant_id = $2',
      [userId, tenantId]
    );
    if (!result.rows[0]) return null;
    return this.mapRow(result.rows[0]);
  }

  async create(data: {
    tenantId: string;
    userId: string;
    ageRange?: string;
    biologicalSexOptional?: string;
    heightCmOptional?: number;
    weightKgOptional?: number;
    fitnessLevel?: string;
    travelFrequency?: string;
    primaryGoal?: string;
    secondaryGoalsJson?: string[];
    dietaryPreferencesJson?: string[];
    dietaryRestrictionsJson?: string[];
    physicalLimitationsJson?: string[];
    preferredWorkoutTypesJson?: string[];
    preferredMealStyleJson?: string;
    sleepGoalHoursOptional?: number;
  }): Promise<UserProfileRow> {
    const result = await query(
      `INSERT INTO user_profiles (tenant_id, user_id, age_range, biological_sex_optional, height_cm_optional, weight_kg_optional, fitness_level, travel_frequency, primary_goal, secondary_goals_json, dietary_preferences_json, dietary_restrictions_json, physical_limitations_json, preferred_workout_types_json, preferred_meal_style_json, sleep_goal_hours_optional)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [
        data.tenantId, data.userId, data.ageRange || null, data.biologicalSexOptional || null,
        data.heightCmOptional || null, data.weightKgOptional || null,
        data.fitnessLevel || 'sedentary', data.travelFrequency || 'rarely',
        data.primaryGoal || null,
        JSON.stringify(data.secondaryGoalsJson || []),
        JSON.stringify(data.dietaryPreferencesJson || []),
        JSON.stringify(data.dietaryRestrictionsJson || []),
        JSON.stringify(data.physicalLimitationsJson || []),
        JSON.stringify(data.preferredWorkoutTypesJson || []),
        data.preferredMealStyleJson || 'balanced',
        data.sleepGoalHoursOptional || null,
      ]
    );
    return this.mapRow(result.rows[0]);
  }

  async update(userId: string, tenantId: string, data: Partial<{
    ageRange: string;
    biologicalSexOptional: string;
    heightCmOptional: number;
    weightKgOptional: number;
    fitnessLevel: string;
    travelFrequency: string;
    primaryGoal: string;
    secondaryGoalsJson: string[];
    dietaryPreferencesJson: string[];
    dietaryRestrictionsJson: string[];
    physicalLimitationsJson: string[];
    preferredWorkoutTypesJson: string[];
    preferredMealStyleJson: string;
    sleepGoalHoursOptional: number;
  }>): Promise<UserProfileRow | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, { column: string; value: unknown }> = {
      ageRange: { column: 'age_range', value: data.ageRange },
      biologicalSexOptional: { column: 'biological_sex_optional', value: data.biologicalSexOptional },
      heightCmOptional: { column: 'height_cm_optional', value: data.heightCmOptional },
      weightKgOptional: { column: 'weight_kg_optional', value: data.weightKgOptional },
      fitnessLevel: { column: 'fitness_level', value: data.fitnessLevel },
      travelFrequency: { column: 'travel_frequency', value: data.travelFrequency },
      primaryGoal: { column: 'primary_goal', value: data.primaryGoal },
      secondaryGoalsJson: { column: 'secondary_goals_json', value: JSON.stringify(data.secondaryGoalsJson) },
      dietaryPreferencesJson: { column: 'dietary_preferences_json', value: JSON.stringify(data.dietaryPreferencesJson) },
      dietaryRestrictionsJson: { column: 'dietary_restrictions_json', value: JSON.stringify(data.dietaryRestrictionsJson) },
      physicalLimitationsJson: { column: 'physical_limitations_json', value: JSON.stringify(data.physicalLimitationsJson) },
      preferredWorkoutTypesJson: { column: 'preferred_workout_types_json', value: JSON.stringify(data.preferredWorkoutTypesJson) },
      preferredMealStyleJson: { column: 'preferred_meal_style_json', value: data.preferredMealStyleJson },
      sleepGoalHoursOptional: { column: 'sleep_goal_hours_optional', value: data.sleepGoalHoursOptional },
    };

    for (const [key, mapping] of Object.entries(fieldMap)) {
      if ((data as Record<string, unknown>)[key] !== undefined) {
        fields.push(`${mapping.column} = $${paramIndex++}`);
        values.push(mapping.value);
      }
    }

    if (fields.length === 0) return this.findByUserId(userId, tenantId);

    fields.push(`updated_at = NOW()`);
    values.push(userId, tenantId);

    const result = await query(
      `UPDATE user_profiles SET ${fields.join(', ')} WHERE user_id = $${paramIndex++} AND tenant_id = $${paramIndex++} RETURNING *`,
      values
    );
    return result.rows[0] ? this.mapRow(result.rows[0]) : null;
  }

  private mapRow(row: Record<string, unknown>): UserProfileRow {
    return {
      ...row,
      secondary_goals_json: parseJsonField<string[]>(row.secondary_goals_json),
      dietary_preferences_json: parseJsonField<string[]>(row.dietary_preferences_json),
      dietary_restrictions_json: parseJsonField<string[]>(row.dietary_restrictions_json),
      physical_limitations_json: parseJsonField<string[]>(row.physical_limitations_json),
      preferred_workout_types_json: parseJsonField<string[]>(row.preferred_workout_types_json),
    } as UserProfileRow;
  }
}
