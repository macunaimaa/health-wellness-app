import { query } from '../config/database';
import { AuditLogRow } from '../models/types';
import { parseJsonField } from '../utils/helpers';

export class AuditRepository {
  async create(data: {
    tenantId: string;
    userIdOptional?: string;
    entityType: string;
    entityId: string;
    action: string;
    beforeJson?: Record<string, unknown>;
    afterJson?: Record<string, unknown>;
    requestId: string;
  }): Promise<AuditLogRow> {
    const result = await query(
      `INSERT INTO audit_logs (tenant_id, user_id_optional, entity_type, entity_id, action, before_json_optional, after_json_optional, request_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.tenantId, data.userIdOptional || null, data.entityType,
        data.entityId, data.action,
        data.beforeJson ? JSON.stringify(data.beforeJson) : null,
        data.afterJson ? JSON.stringify(data.afterJson) : null,
        data.requestId,
      ]
    );
    return this.mapRow(result.rows[0]);
  }

  private mapRow(row: Record<string, unknown>): AuditLogRow {
    return {
      ...row,
      before_json_optional: parseJsonField<Record<string, unknown>>(row.before_json_optional),
      after_json_optional: parseJsonField<Record<string, unknown>>(row.after_json_optional),
    } as AuditLogRow;
  }
}
