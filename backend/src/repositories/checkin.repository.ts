import { query } from '../config/database';
import { DailyCheckinRow } from '../models/types';
import { parseJsonField } from '../utils/helpers';

export class CheckinRepository {
  async findByUserAndDate(userId: string, tenantId: string, date: string): Promise<DailyCheckinRow | null> {
    const result = await query(
      'SELECT * FROM daily_checkins WHERE user_id = $1 AND tenant_id = $2 AND checkin_date = $3',
      [userId, tenantId, date]
    );
    if (!result.rows[0]) return null;
    return this.mapRow(result.rows[0]);
  }

  async findToday(userId: string, tenantId: string): Promise<DailyCheckinRow | null> {
    return this.findByUserAndDate(userId, tenantId, new Date().toISOString().split('T')[0]);
  }

  async upsert(data: {
    tenantId: string;
    userId: string;
    checkinDate: string;
    energyLevel: number;
    stressLevel: number;
    sleepQuality: number;
    availableMinutes?: number;
    contextType?: string;
    locationContextJson?: Record<string, unknown>;
    mealWindowsJson?: unknown[];
    equipmentAccessJson?: string[];
    notesOptional?: string;
  }): Promise<DailyCheckinRow> {
    const result = await query(
      `INSERT INTO daily_checkins (tenant_id, user_id, checkin_date, energy_level, stress_level, sleep_quality, available_minutes, context_type, location_context_json, meal_windows_json, equipment_access_json, notes_optional)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (user_id, checkin_date) DO UPDATE SET
         energy_level = EXCLUDED.energy_level,
         stress_level = EXCLUDED.stress_level,
         sleep_quality = EXCLUDED.sleep_quality,
         available_minutes = EXCLUDED.available_minutes,
         context_type = EXCLUDED.context_type,
         location_context_json = EXCLUDED.location_context_json,
         meal_windows_json = EXCLUDED.meal_windows_json,
         equipment_access_json = EXCLUDED.equipment_access_json,
         notes_optional = EXCLUDED.notes_optional
       RETURNING *`,
      [
        data.tenantId, data.userId, data.checkinDate,
        data.energyLevel, data.stressLevel, data.sleepQuality,
        data.availableMinutes || null, data.contextType || null,
        JSON.stringify(data.locationContextJson || {}),
        JSON.stringify(data.mealWindowsJson || []),
        JSON.stringify(data.equipmentAccessJson || []),
        data.notesOptional || null,
      ]
    );
    return this.mapRow(result.rows[0]);
  }

  async findRecentByUser(userId: string, tenantId: string, days: number = 7): Promise<DailyCheckinRow[]> {
    const result = await query(
      `SELECT * FROM daily_checkins
       WHERE user_id = $1 AND tenant_id = $2 AND checkin_date >= CURRENT_DATE - $3::integer
       ORDER BY checkin_date DESC`,
      [userId, tenantId, days]
    );
    return result.rows.map((row: Record<string, unknown>) => this.mapRow(row));
  }

  async countByTenantSince(tenantId: string, since: Date): Promise<number> {
    const result = await query(
      'SELECT COUNT(DISTINCT user_id) as count FROM daily_checkins WHERE tenant_id = $1 AND checkin_date >= $2',
      [tenantId, since.toISOString().split('T')[0]]
    );
    return parseInt(result.rows[0].count, 10);
  }

  async totalCountByTenantSince(tenantId: string, since: Date): Promise<number> {
    const result = await query(
      'SELECT COUNT(*) as count FROM daily_checkins WHERE tenant_id = $1 AND checkin_date >= $2',
      [tenantId, since.toISOString().split('T')[0]]
    );
    return parseInt(result.rows[0].count, 10);
  }

  async daysSinceLastCheckin(userId: string, tenantId: string): Promise<number> {
    const result = await query(
      `SELECT CURRENT_DATE - MAX(checkin_date) as days
       FROM daily_checkins WHERE user_id = $1 AND tenant_id = $2`,
      [userId, tenantId]
    );
    return parseInt(result.rows[0]?.days, 10) || 999;
  }

  private mapRow(row: Record<string, unknown>): DailyCheckinRow {
    return {
      ...row,
      location_context_json: parseJsonField<Record<string, unknown>>(row.location_context_json),
      meal_windows_json: parseJsonField<unknown[]>(row.meal_windows_json),
      equipment_access_json: parseJsonField<string[]>(row.equipment_access_json),
    } as DailyCheckinRow;
  }
}
