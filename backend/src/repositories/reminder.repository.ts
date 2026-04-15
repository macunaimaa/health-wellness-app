import { query } from '../config/database';
import { ReminderRow } from '../models/types';
import { parseJsonField } from '../utils/helpers';

export class ReminderRepository {
  async findByUser(userId: string, tenantId: string): Promise<ReminderRow[]> {
    const result = await query(
      'SELECT * FROM reminders WHERE user_id = $1 AND tenant_id = $2 ORDER BY reminder_type',
      [userId, tenantId]
    );
    return result.rows.map((row: Record<string, unknown>) => this.mapRow(row));
  }

  async upsertMany(userId: string, tenantId: string, reminders: Array<{
    reminderType: string;
    scheduleJson: Record<string, unknown>;
    channel?: string;
    active?: boolean;
  }>): Promise<ReminderRow[]> {
    const results: ReminderRow[] = [];

    await query('DELETE FROM reminders WHERE user_id = $1 AND tenant_id = $2', [userId, tenantId]);

    for (const r of reminders) {
      const result = await query(
        `INSERT INTO reminders (tenant_id, user_id, reminder_type, schedule_json, channel, active)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          tenantId, userId, r.reminderType,
          JSON.stringify(r.scheduleJson), r.channel || 'in_app',
          r.active !== undefined ? r.active : true,
        ]
      );
      results.push(this.mapRow(result.rows[0]));
    }

    return results;
  }

  private mapRow(row: Record<string, unknown>): ReminderRow {
    return {
      ...row,
      schedule_json: parseJsonField<Record<string, unknown>>(row.schedule_json),
    } as ReminderRow;
  }
}
