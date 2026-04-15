import { query } from '../config/database';
import { RecommendationRow } from '../models/types';
import { parseJsonField } from '../utils/helpers';

export class RecommendationRepository {
  async create(data: {
    tenantId: string;
    userId: string;
    checkinId: string;
    recommendationType: string;
    title: string;
    summary: string;
    rationale: string;
    payloadJson: Record<string, unknown>;
    intensityLevelOptional?: string;
    validUntil?: string;
  }): Promise<RecommendationRow> {
    const result = await query(
      `INSERT INTO recommendations (tenant_id, user_id, checkin_id, recommendation_type, title, summary, rationale, payload_json, intensity_level_optional, valid_until)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.tenantId, data.userId, data.checkinId, data.recommendationType,
        data.title, data.summary, data.rationale,
        JSON.stringify(data.payloadJson), data.intensityLevelOptional || null,
        data.validUntil || null,
      ]
    );
    return this.mapRow(result.rows[0]);
  }

  async findById(id: string, tenantId: string): Promise<RecommendationRow | null> {
    const result = await query(
      'SELECT * FROM recommendations WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );
    if (!result.rows[0]) return null;
    return this.mapRow(result.rows[0]);
  }

  async findToday(userId: string, tenantId: string): Promise<RecommendationRow[]> {
    const result = await query(
      `SELECT * FROM recommendations
       WHERE user_id = $1 AND tenant_id = $2 AND DATE(generated_at) = CURRENT_DATE
       ORDER BY generated_at DESC`,
      [userId, tenantId]
    );
    return result.rows.map((row: Record<string, unknown>) => this.mapRow(row));
  }

  async findRecentByUser(userId: string, tenantId: string, days: number = 7): Promise<RecommendationRow[]> {
    const result = await query(
      `SELECT * FROM recommendations
       WHERE user_id = $1 AND tenant_id = $2 AND generated_at >= NOW() - $3::interval
       ORDER BY generated_at DESC`,
      [userId, tenantId, `${days} days`]
    );
    return result.rows.map((row: Record<string, unknown>) => this.mapRow(row));
  }

  async updateStatus(id: string, tenantId: string, status: string): Promise<RecommendationRow | null> {
    const result = await query(
      'UPDATE recommendations SET status = $1 WHERE id = $2 AND tenant_id = $3 RETURNING *',
      [status, id, tenantId]
    );
    if (!result.rows[0]) return null;
    return this.mapRow(result.rows[0]);
  }

  async countByStatus(tenantId: string, since: Date): Promise<Record<string, number>> {
    const result = await query(
      `SELECT status, COUNT(*) as count FROM recommendations
       WHERE tenant_id = $1 AND generated_at >= $2
       GROUP BY status`,
      [tenantId, since.toISOString()]
    );
    const counts: Record<string, number> = {};
    for (const row of result.rows) {
      counts[row.status] = parseInt(row.count, 10);
    }
    return counts;
  }

  async countCompletedByUser(userId: string, tenantId: string, since: Date): Promise<number> {
    const result = await query(
      `SELECT COUNT(*) as count FROM recommendations
       WHERE user_id = $1 AND tenant_id = $2 AND status = 'completed' AND generated_at >= $3`,
      [userId, tenantId, since.toISOString()]
    );
    return parseInt(result.rows[0].count, 10);
  }

  async countByUserSince(userId: string, tenantId: string, since: Date): Promise<number> {
    const result = await query(
      `SELECT COUNT(*) as count FROM recommendations
       WHERE user_id = $1 AND tenant_id = $2 AND generated_at >= $3`,
      [userId, tenantId, since.toISOString()]
    );
    return parseInt(result.rows[0].count, 10);
  }

  private mapRow(row: Record<string, unknown>): RecommendationRow {
    return {
      ...row,
      payload_json: parseJsonField<Record<string, unknown>>(row.payload_json),
    } as RecommendationRow;
  }
}
