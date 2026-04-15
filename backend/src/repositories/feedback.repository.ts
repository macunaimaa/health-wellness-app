import { query } from '../config/database';
import { RecommendationFeedbackRow } from '../models/types';

export class FeedbackRepository {
  async create(data: {
    tenantId: string;
    userId: string;
    recommendationId: string;
    feedbackType: string;
    scoreOptional?: number;
    reasonCodeOptional?: string;
    commentOptional?: string;
  }): Promise<RecommendationFeedbackRow> {
    const result = await query(
      `INSERT INTO recommendation_feedback (tenant_id, user_id, recommendation_id, feedback_type, score_optional, reason_code_optional, comment_optional)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.tenantId, data.userId, data.recommendationId, data.feedbackType,
        data.scoreOptional || null, data.reasonCodeOptional || null, data.commentOptional || null,
      ]
    );
    return result.rows[0];
  }

  async findByUser(userId: string, tenantId: string, days: number = 30): Promise<RecommendationFeedbackRow[]> {
    const result = await query(
      `SELECT * FROM recommendation_feedback
       WHERE user_id = $1 AND tenant_id = $2 AND created_at >= NOW() - $3::interval
       ORDER BY created_at DESC`,
      [userId, tenantId, `${days} days`]
    );
    return result.rows;
  }

  async findByRecommendationId(recommendationId: string, tenantId: string): Promise<RecommendationFeedbackRow[]> {
    const result = await query(
      'SELECT * FROM recommendation_feedback WHERE recommendation_id = $1 AND tenant_id = $2 ORDER BY created_at DESC',
      [recommendationId, tenantId]
    );
    return result.rows;
  }
}
