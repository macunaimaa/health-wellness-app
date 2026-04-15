import { Response, NextFunction } from 'express';
import { CheckinService } from '../services/checkin.service';
import { RecommendationService } from '../services/recommendation.service';
import { AuthenticatedRequest } from '../models/types';

const checkinService = new CheckinService();
const recommendationService = new RecommendationService();

const CONTEXT_MAP: Record<string, string> = {
  casa: 'home',
  escritorio: 'office',
  aeroporto: 'airport',
  hotel: 'hotel',
  carro: 'car',
  reunioes: 'continuous_meetings',
};

function formatCheckin(row: any) {
  const CONTEXT_RMAP: Record<string, string> = {
    home: 'casa',
    office: 'escritorio',
    travel: 'aeroporto',
    airport: 'aeroporto',
    hotel: 'hotel',
    car: 'carro',
    continuous_meetings: 'reunioes',
  };

  return {
    id: row.id,
    userId: row.user_id,
    energyLevel: row.energy_level,
    stressLevel: row.stress_level,
    sleepQuality: row.sleep_quality,
    availableTime: row.available_minutes,
    dayContext: CONTEXT_RMAP[row.context_type] || row.context_type,
    equipmentAccess: row.equipment_access_json || [],
    notes: row.notes_optional || '',
    createdAt: row.created_at,
  };
}

function formatRecommendation(row: any) {
  const INTENSITY_MAP: Record<string, string> = {
    low: 'leve',
    moderate: 'moderado',
    high: 'intenso',
  };
  const STATUS_MAP: Record<string, string> = {
    active: 'pending',
    pending: 'pending',
    accepted: 'accepted',
    completed: 'completed',
    dismissed: 'dismissed',
  };

  return {
    id: row.id,
    checkinId: row.checkin_id,
    type: row.recommendation_type,
    title: row.title,
    summary: row.summary || '',
    rationale: row.rationale || '',
    intensity: INTENSITY_MAP[row.intensity_level_optional] || row.intensity_level_optional,
    status: STATUS_MAP[row.status] || row.status,
    metadata: row.payload_json || {},
    createdAt: row.generated_at,
    expiresAt: row.valid_until || '',
  };
}

export class CheckinController {
  async createCheckin(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const body = req.body;
    const today = new Date().toISOString().split('T')[0];

    const checkin = await checkinService.upsertCheckin({
      tenantId: req.user!.tenantId,
      userId: req.user!.userId,
      checkinDate: today,
      energyLevel: body.energyLevel,
      stressLevel: body.stressLevel,
      sleepQuality: body.sleepQuality,
      availableMinutes: body.availableTime,
      contextType: CONTEXT_MAP[body.dayContext] || body.dayContext,
      equipmentAccessJson: body.equipmentAccess || [],
      notesOptional: body.notes,
    }, req.requestId!);

    let recommendations = await recommendationService.getTodayRecommendations(
      req.user!.userId,
      req.user!.tenantId,
    );

    if (recommendations.length === 0) {
      try {
        recommendations = await recommendationService.generateRecommendations(
          req.user!.userId,
          req.user!.tenantId,
          req.requestId!,
        );
      } catch {
        recommendations = [];
      }
    }

    res.json({
      checkin: formatCheckin(checkin),
      recommendations: recommendations.map(formatRecommendation),
    });
  }

  async getTodayPlan(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const checkin = await checkinService.getToday(req.user!.userId, req.user!.tenantId);

    if (!checkin) {
      res.json(null);
      return;
    }

    const recommendations = await recommendationService.getTodayRecommendations(
      req.user!.userId,
      req.user!.tenantId,
    );

    res.json({
      checkin: formatCheckin(checkin),
      recommendations: recommendations.map(formatRecommendation),
    });
  }

  async getHistory(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const limit = parseInt(req.query.limit as string) || 30;
    const checkins = await checkinService.getRecent(req.user!.userId, req.user!.tenantId, limit);
    res.json(checkins.map(formatCheckin));
  }
}
