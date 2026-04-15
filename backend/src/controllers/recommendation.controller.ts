import { Response, NextFunction } from 'express';
import { RecommendationService } from '../services/recommendation.service';
import { AuthenticatedRequest } from '../models/types';

const recommendationService = new RecommendationService();

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

export class RecommendationController {
  async getByCheckin(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const recommendations = await recommendationService.getTodayRecommendations(
      req.user!.userId,
      req.user!.tenantId,
    );
    res.json(recommendations.map(formatRecommendation));
  }

  async submitFeedback(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const { id } = req.params;
    const body = req.body;

    await recommendationService.submitFeedback(
      id,
      req.user!.userId,
      req.user!.tenantId,
      body.status || 'completed',
      undefined,
      undefined,
      undefined,
      req.requestId,
    );

    const rec = await recommendationService.getTodayRecommendations(
      req.user!.userId,
      req.user!.tenantId,
    );
    const updated = rec.find(r => r.id === id);
    res.json(updated ? formatRecommendation(updated) : null);
  }

  async regenerate(req: AuthenticatedRequest, res: Response, _next: NextFunction) {
    const recommendations = await recommendationService.generateRecommendations(
      req.user!.userId,
      req.user!.tenantId,
      req.requestId!,
    );
    res.json(recommendations.map(formatRecommendation));
  }
}
