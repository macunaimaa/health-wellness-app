import { query } from '../config/database';
import { parseJsonField } from '../utils/helpers';

export class BaseRepository {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected async findByIdAndTenant<T>(id: string, tenantId: string): Promise<T | null> {
    const result = await query(
      `SELECT * FROM ${this.tableName} WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );
    return result.rows[0] ? this.mapRow<T>(result.rows[0]) : null;
  }

  protected async findAllByTenant<T>(tenantId: string, limit = 50, offset = 0): Promise<T[]> {
    const result = await query(
      `SELECT * FROM ${this.tableName} WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [tenantId, limit, offset]
    );
    return result.rows.map((row: Record<string, unknown>) => this.mapRow<T>(row));
  }

  protected async countByTenant(tenantId: string): Promise<number> {
    const result = await query(
      `SELECT COUNT(*) as count FROM ${this.tableName} WHERE tenant_id = $1`,
      [tenantId]
    );
    return parseInt(result.rows[0].count, 10);
  }

  protected async deleteByIdAndTenant(id: string, tenantId: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM ${this.tableName} WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  protected mapRow<T>(row: Record<string, unknown>): T {
    const mapped = { ...row };
    for (const key of Object.keys(mapped)) {
      if (key.endsWith('_json')) {
        mapped[key] = parseJsonField(mapped[key]);
      }
    }
    return mapped as T;
  }

  protected async existsByTenant(id: string, tenantId: string): Promise<boolean> {
    const result = await query(
      `SELECT 1 FROM ${this.tableName} WHERE id = $1 AND tenant_id = $2 LIMIT 1`,
      [id, tenantId]
    );
    return result.rows.length > 0;
  }
}
