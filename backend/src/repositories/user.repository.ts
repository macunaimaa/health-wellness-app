import { query } from '../config/database';
import { UserRow } from '../models/types';

export class UserRepository {
  async findById(id: string, tenantId: string): Promise<UserRow | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  async create(data: {
    tenantId: string;
    email: string;
    passwordHash: string;
    fullName: string;
    role?: string;
  }): Promise<UserRow> {
    const result = await query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.tenantId, data.email, data.passwordHash, data.fullName, data.role || 'user']
    );
    return result.rows[0];
  }

  async findAllByTenant(tenantId: string, limit: number, offset: number): Promise<UserRow[]> {
    const result = await query(
      'SELECT id, tenant_id, email, full_name, role, timezone, locale, status, created_at, updated_at FROM users WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [tenantId, limit, offset]
    );
    return result.rows;
  }

  async countByTenant(tenantId: string): Promise<number> {
    const result = await query(
      'SELECT COUNT(*) as count FROM users WHERE tenant_id = $1',
      [tenantId]
    );
    return parseInt(result.rows[0].count, 10);
  }

  async updateLastSeen(id: string): Promise<void> {
    await query('UPDATE users SET updated_at = NOW() WHERE id = $1', [id]);
  }
}
