import { FeedbackRepository } from '../repositories/feedback.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { RecommendationFeedbackRow } from '../models/types';

const feedbackRepo = new FeedbackRepository();
const auditRepo = new AuditRepository();

export class FeedbackService {
  async createFeedback(data: {
    tenantId: string;
    userId: string;
    recommendationId: string;
    feedbackType: string;
    scoreOptional?: number;
    reasonCodeOptional?: string;
    commentOptional?: string;
  }, requestId: string): Promise<RecommendationFeedbackRow> {
    const feedback = await feedbackRepo.create(data);

    await auditRepo.create({
      tenantId: data.tenantId,
      userIdOptional: data.userId,
      entityType: 'recommendation_feedback',
      entityId: feedback.id,
      action: 'create',
      afterJson: feedback as unknown as Record<string, unknown>,
      requestId,
    });

    return feedback;
  }

  async getFeedbackByUser(userId: string, tenantId: string, days: number = 30): Promise<RecommendationFeedbackRow[]> {
    return feedbackRepo.findByUser(userId, tenantId, days);
  }

  async getFeedbackForRecommendation(recommendationId: string, tenantId: string): Promise<RecommendationFeedbackRow[]> {
    return feedbackRepo.findByRecommendationId(recommendationId, tenantId);
  }
}
