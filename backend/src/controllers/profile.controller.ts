import { Response, NextFunction } from 'express';
import { ProfileService } from '../services/profile.service';
import { AuthenticatedRequest } from '../models/types';

const profileService = new ProfileService();

const createProfileSchema = {
  primaryGoal: 'primary_goal',
  dietaryRestrictions: 'dietary_restrictions_json',
  physicalLimitations: 'physical_limitations_json',
  fitnessLevel: 'fitness_level',
  travelFrequency: 'travel_frequency',
  preferredWorkoutTypes: 'preferred_workout_types_json',
  mealStyle: 'preferred_meal_style_json',
} as const;

const FITNESS_MAP: Record<string, string> = {
  iniciante: 'sedentary',
  intermediario: 'moderate',
  avancado: 'active',
};

const TRAVEL_MAP: Record<string, string> = {
  nunca: 'rarely',
  raramente: 'rarely',
  mensalmente: 'monthly',
  semanalmente: 'weekly',
  frequentemente: 'very_frequently',
};

const MEAL_STYLE_MAP: Record<string, string> = {
  rapido_simples: 'quick_and_simple',
  equilibrado: 'balanced',
  gourmet: 'gourmet',
  performance: 'performance',
};

function formatProfile(row: any) {
  const FITNESS_RMAP: Record<string, string> = {
    sedentary: 'iniciante',
    light: 'iniciante',
    moderate: 'intermediario',
    active: 'avancado',
    athlete: 'avancado',
  };
  const TRAVEL_RMAP: Record<string, string> = {
    rarely: 'raramente',
    monthly: 'mensalmente',
    weekly: 'semanalmente',
    very_frequently: 'frequentemente',
  };
  const MEAL_RMAP: Record<string, string> = {
    quick_and_simple: 'rapido_simples',
    balanced: 'equilibrado',
    gourmet: 'gourmet',
    performance: 'performance',
  };

  return {
    id: row.id,
    userId: row.user_id,
    primaryGoal: row.primary_goal,
    dietaryRestrictions: row.dietary_restrictions_json || [],
    physicalLimitations: row.physical_limitations_json || [],
    fitnessLevel: FITNESS_RMAP[row.fitness_level] || row.fitness_level,
    travelFrequency: TRAVEL_RMAP[row.travel_frequency] || row.travel_frequency,
    preferredWorkoutTypes: row.preferred_workout_types_json || [],
    mealStyle: MEAL_RMAP[row.preferred_meal_style_json] || row.preferred_meal_style_json,
    completedAt: row.created_at,
  };
}

export class ProfileController {
  async getProfile(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const profile = await profileService.getProfile(req.user!.userId, req.user!.tenantId);
    res.json(formatProfile(profile));
  }

  async createProfile(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const body = req.body;
    const data = {
      primaryGoal: body.primaryGoal,
      dietaryRestrictionsJson: body.dietaryRestrictions || [],
      physicalLimitationsJson: body.physicalLimitations || [],
      fitnessLevel: FITNESS_MAP[body.fitnessLevel] || body.fitnessLevel || 'sedentary',
      travelFrequency: TRAVEL_MAP[body.travelFrequency] || body.travelFrequency || 'rarely',
      preferredWorkoutTypesJson: body.preferredWorkoutTypes || [],
      preferredMealStyleJson: MEAL_STYLE_MAP[body.mealStyle] || body.mealStyle || 'balanced',
    };

    const profile = await profileService.updateProfile(
      req.user!.userId,
      req.user!.tenantId,
      data,
      req.requestId!,
    );
    res.status(201).json(formatProfile(profile));
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const body = req.body;
    const mapped: Record<string, unknown> = {};

    if (body.primaryGoal !== undefined) mapped.primaryGoal = body.primaryGoal;
    if (body.dietaryRestrictions !== undefined) mapped.dietaryRestrictionsJson = body.dietaryRestrictions;
    if (body.physicalLimitations !== undefined) mapped.physicalLimitationsJson = body.physicalLimitations;
    if (body.fitnessLevel !== undefined) mapped.fitnessLevel = FITNESS_MAP[body.fitnessLevel] || body.fitnessLevel;
    if (body.travelFrequency !== undefined) mapped.travelFrequency = TRAVEL_MAP[body.travelFrequency] || body.travelFrequency;
    if (body.preferredWorkoutTypes !== undefined) mapped.preferredWorkoutTypesJson = body.preferredWorkoutTypes;
    if (body.mealStyle !== undefined) mapped.preferredMealStyleJson = MEAL_STYLE_MAP[body.mealStyle] || body.mealStyle;

    const profile = await profileService.updateProfile(
      req.user!.userId,
      req.user!.tenantId,
      mapped,
      req.requestId!,
    );
    res.json(formatProfile(profile));
  }
}
