import { v4 as uuidv4 } from 'uuid';
import { RecommendationRepository } from '../repositories/recommendation.repository';
import { FeedbackRepository } from '../repositories/feedback.repository';
import { CheckinRepository } from '../repositories/checkin.repository';
import { ProfileRepository } from '../repositories/profile.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { MealService } from './meal.service';
import { WorkoutService } from './workout.service';
import { TravelService } from './travel.service';
import { RecoveryService } from './recovery.service';
import { generateHydrationRecommendation } from './openai.service';
import {
  DailyCheckinRow,
  UserProfileRow,
  RecommendationRow,
  RecommendationFeedbackRow,
  GeneratedRecommendation,
} from '../models/types';
import { NotFoundError } from '../utils/errors';

const recommendationRepo = new RecommendationRepository();
const feedbackRepo = new FeedbackRepository();
const checkinRepo = new CheckinRepository();
const profileRepo = new ProfileRepository();
const auditRepo = new AuditRepository();
const mealService = new MealService();
const workoutService = new WorkoutService();
const travelService = new TravelService();
const recoveryService = new RecoveryService();

export class RecommendationService {
  async generateRecommendations(userId: string, tenantId: string, requestId: string): Promise<RecommendationRow[]> {
    const checkin = await checkinRepo.findToday(userId, tenantId);
    if (!checkin) {
      throw new NotFoundError('Faça o check-in diário antes de gerar recomendações');
    }

    const profile = await profileRepo.findByUserId(userId, tenantId);
    if (!profile) {
      throw new NotFoundError('Perfil não encontrado');
    }

    const recentRecommendations = await recommendationRepo.findRecentByUser(userId, tenantId, 7);
    const recentFeedback = await feedbackRepo.findByUser(userId, tenantId, 30);
    const daysSinceLastActivity = await checkinRepo.daysSinceLastCheckin(userId, tenantId);

    const generated = await this.engine({
      userId,
      tenantId,
      checkin,
      profile,
      recentRecommendations,
      recentFeedback,
      daysSinceLastActivity,
    });

    const saved: RecommendationRow[] = [];
    for (const rec of generated) {
      const row = await recommendationRepo.create({
        tenantId,
        userId,
        checkinId: checkin.id,
        recommendationType: rec.recommendation_type,
        title: rec.title,
        summary: rec.summary,
        rationale: rec.rationale,
        payloadJson: rec.payload_json,
        intensityLevelOptional: rec.intensity_level_optional || undefined,
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      saved.push(row);
    }

    await auditRepo.create({
      tenantId,
      userIdOptional: userId,
      entityType: 'recommendations',
      entityId: saved[0]?.id || uuidv4(),
      action: 'generate',
      afterJson: { count: saved.length },
      requestId,
    });

    return saved;
  }

  async getTodayRecommendations(userId: string, tenantId: string): Promise<RecommendationRow[]> {
    return recommendationRepo.findToday(userId, tenantId);
  }

  async submitFeedback(
    recommendationId: string,
    userId: string,
    tenantId: string,
    feedbackType: string,
    score?: number,
    reasonCode?: string,
    comment?: string,
    requestId?: string,
  ) {
    const rec = await recommendationRepo.findById(recommendationId, tenantId);
    if (!rec) {
      throw new NotFoundError('Recomendação não encontrada');
    }

    const feedback = await feedbackRepo.create({
      tenantId,
      userId,
      recommendationId,
      feedbackType,
      scoreOptional: score,
      reasonCodeOptional: reasonCode,
      commentOptional: comment,
    });

    if (feedbackType === 'completed') {
      await recommendationRepo.updateStatus(recommendationId, tenantId, 'completed');
    } else if (feedbackType === 'dismissed') {
      await recommendationRepo.updateStatus(recommendationId, tenantId, 'dismissed');
    }

    if (requestId) {
      await auditRepo.create({
        tenantId,
        userIdOptional: userId,
        entityType: 'recommendation_feedback',
        entityId: feedback.id,
        action: 'create',
        afterJson: feedback as unknown as Record<string, unknown>,
        requestId,
      });
    }

    return feedback;
  }

  async completeRecommendation(
    recommendationId: string,
    userId: string,
    tenantId: string,
    score?: number,
    requestId?: string,
  ) {
    const rec = await recommendationRepo.findById(recommendationId, tenantId);
    if (!rec) {
      throw new NotFoundError('Recomendação não encontrada');
    }

    const updated = await recommendationRepo.updateStatus(recommendationId, tenantId, 'completed');

    const feedback = await feedbackRepo.create({
      tenantId,
      userId,
      recommendationId,
      feedbackType: 'completed',
      scoreOptional: score,
    });

    if (requestId) {
      await auditRepo.create({
        tenantId,
        userIdOptional: userId,
        entityType: 'recommendation',
        entityId: recommendationId,
        action: 'complete',
        afterJson: updated as unknown as Record<string, unknown>,
        requestId,
      });
    }

    return { recommendation: updated, feedback };
  }

  private async engine(input: {
    userId: string;
    tenantId: string;
    checkin: DailyCheckinRow;
    profile: UserProfileRow;
    recentRecommendations: RecommendationRow[];
    recentFeedback: RecommendationFeedbackRow[];
    daysSinceLastActivity: number;
  }): Promise<GeneratedRecommendation[]> {
    const { checkin, profile, recentRecommendations, recentFeedback, daysSinceLastActivity } = input;
    const recommendations: GeneratedRecommendation[] = [];

    const negativeCategories = this.getNegativeCategories(recentFeedback);
    const recentTitles = new Set(recentRecommendations.slice(0, 5).map(r => r.title));
    const hasRecentPositiveActivity = recentFeedback.some(
      f => f.feedback_type === 'completed' && f.created_at > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    );

    const contextType = checkin.context_type || 'home';
    const isTravel = travelService.isTravelContext(contextType);

    // Run all AI calls in parallel
    const shouldIncludeWorkouts = !negativeCategories.has('workout') ||
      recentFeedback.filter(f => f.feedback_type === 'completed').length >=
      recentFeedback.filter(f => f.feedback_type === 'dismissed').length;

    const needsRecovery = checkin.energy_level <= 2 ||
      (checkin.sleep_quality <= 2 && checkin.stress_level >= 4) ||
      checkin.stress_level >= 4;

    const [mealRecs, workoutRecs, recoveryRecs, travelMeals, travelTips, hydration] = await Promise.all([
      mealService.getRecommendations({
        contextType,
        availableMinutes: checkin.available_minutes || 30,
        energyLevel: checkin.energy_level,
        stressLevel: checkin.stress_level,
        sleepQuality: checkin.sleep_quality,
        dietaryPreferences: profile.dietary_preferences_json,
        dietaryRestrictions: profile.dietary_restrictions_json,
        equipment: checkin.equipment_access_json,
      }),
      shouldIncludeWorkouts ? workoutService.getRecommendations({
        contextType,
        availableMinutes: checkin.available_minutes || 30,
        energyLevel: checkin.energy_level,
        sleepQuality: checkin.sleep_quality,
        stressLevel: checkin.stress_level,
        fitnessLevel: profile.fitness_level,
        preferredWorkoutTypes: profile.preferred_workout_types_json,
        physicalLimitations: profile.physical_limitations_json,
        equipment: checkin.equipment_access_json,
        daysSinceLastActivity,
      }) : Promise.resolve([]),
      needsRecovery ? recoveryService.getRecommendations({
        energyLevel: checkin.energy_level,
        stressLevel: checkin.stress_level,
        sleepQuality: checkin.sleep_quality,
        contextType,
        availableMinutes: checkin.available_minutes || 15,
        recentActivity: hasRecentPositiveActivity,
      }) : Promise.resolve([]),
      isTravel ? travelService.getTravelMeals(contextType, profile.dietary_restrictions_json) : Promise.resolve([]),
      isTravel ? travelService.getTravelTips(contextType) : Promise.resolve([]),
      generateHydrationRecommendation(checkin.energy_level, checkin.stress_level, contextType),
    ]);

    for (const meal of mealRecs) {
      if (recentTitles.has(meal.name)) continue;
      recommendations.push({
        recommendation_type: 'meal',
        title: meal.name,
        summary: meal.description,
        rationale: meal.rationale,
        payload_json: {
          calories: meal.calories,
          proteinG: meal.proteinG,
          carbsG: meal.carbsG,
          fatG: meal.fatG,
          prepMinutes: meal.prepMinutes,
          tags: meal.tags,
        },
        intensity_level_optional: meal.intensityLevel,
      });
    }

    for (const workout of workoutRecs) {
      if (recentTitles.has(workout.name)) continue;
      recommendations.push({
        recommendation_type: 'workout',
        title: workout.name,
        summary: workout.description,
        rationale: workout.rationale,
        payload_json: {
          durationMinutes: workout.durationMinutes,
          exercises: workout.exercises,
          calorieBurn: workout.calorieBurn,
          tags: workout.tags,
        },
        intensity_level_optional: workout.intensityLevel,
      });
    }

    for (const recovery of recoveryRecs) {
      if (recentTitles.has(recovery.name)) continue;
      recommendations.push({
        recommendation_type: 'recovery',
        title: recovery.name,
        summary: recovery.description,
        rationale: recovery.rationale,
        payload_json: {
          techniques: recovery.techniques,
          durationMinutes: recovery.durationMinutes,
          tags: recovery.tags,
        },
        intensity_level_optional: recovery.intensityLevel,
      });
    }

    if (isTravel) {
      if (travelMeals.length > 0 && !recommendations.some(r => r.recommendation_type === 'meal' && r.title.includes('viagem'))) {
        const firstMeal = travelMeals[0];
        if (!recentTitles.has(firstMeal.name)) {
          recommendations.push({
            recommendation_type: 'meal',
            title: `[Viagem] ${firstMeal.name}`,
            summary: firstMeal.description,
            rationale: `${firstMeal.rationale} Onde encontrar: ${firstMeal.where}`,
            payload_json: { where: firstMeal.where, isTravelSpecific: true },
            intensity_level_optional: 'low',
          });
        }
      }

      if (travelTips.length > 0) {
        const firstTip = travelTips[0];
        recommendations.push({
          recommendation_type: 'recovery',
          title: `Dica de Viagem: ${firstTip.category}`,
          summary: firstTip.tip,
          rationale: firstTip.rationale,
          payload_json: { category: firstTip.category, isTravelTip: true },
          intensity_level_optional: 'low',
        });
      }
    }

    recommendations.push({
      recommendation_type: 'hydration',
      title: 'Hidratação do Dia',
      summary: hydration.summary,
      rationale: hydration.rationale,
      payload_json: {
        targetLiters: hydration.targetLiters,
        intervalMinutes: 60,
        tips: hydration.tips,
      },
      intensity_level_optional: null,
    });

    return recommendations;
  }

  private getNegativeCategories(feedback: RecommendationFeedbackRow[]): Set<string> {
    const negativeCategories = new Set<string>();
    const recentNegative = feedback.filter(
      f => (f.feedback_type === 'dismissed' || (f.score_optional !== null && f.score_optional <= 2))
        && f.created_at > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    );

    const categoryDismissCounts: Record<string, number> = {};
    for (const f of recentNegative) {
      categoryDismissCounts[f.recommendation_id] = (categoryDismissCounts[f.recommendation_id] || 0) + 1;
    }

    for (const [, count] of Object.entries(categoryDismissCounts)) {
      if (count >= 2) {
        negativeCategories.add('workout');
      }
    }

    return negativeCategories;
  }
}
